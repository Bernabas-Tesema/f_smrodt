import time
import logging
from typing import Dict, Any, Optional
from ..models import AIProviderConfig, AIInferenceLog
from ..providers.gemini_provider import GeminiProvider
from ..providers.openai_provider import OpenAIProvider
from ..providers.anthropic_provider import AnthropicProvider
from ..providers.base import BaseAIProvider

logger = logging.getLogger('smrod.ai.intelligence')


class AIIntelligenceService:
    """
    Central Orchestrator for AI Model Selection, Failover, Usage Logging, and Metrics.
    Ensures that external AI failures do not crash core telematics or control loops.
    """

    @classmethod
    def get_active_provider(cls) -> BaseAIProvider:
        """
        Retrieves the configured active AI provider from the database or defaults to Gemini.
        """
        try:
            config = AIProviderConfig.objects.filter(is_active=True).first()
            if config:
                if config.provider == 'openai':
                    return OpenAIProvider(model_name=config.model_name)
                elif config.provider == 'anthropic':
                    return AnthropicProvider(model_name=config.model_name)
                else:
                    return GeminiProvider(model_name=config.model_name)
        except Exception as e:
            logger.warning(f"Failed to load AI provider config from DB: {e}. Falling back to default Gemini.")
        
        return GeminiProvider(model_name='gemini-2.5-flash')

    @classmethod
    def log_inference(
        cls,
        provider: str,
        model: str,
        endpoint: str,
        tokens_used: int,
        latency_ms: int,
        is_success: bool = True,
        error_message: Optional[str] = None,
        cost_usd: float = 0.0001
    ):
        """
        Persists operational metadata to AIInferenceLog and updates provider metrics.
        """
        try:
            AIInferenceLog.objects.create(
                provider=provider,
                model=model,
                endpoint=endpoint,
                prompt_tokens=int(tokens_used * 0.6),
                completion_tokens=int(tokens_used * 0.4),
                total_tokens=tokens_used,
                cost_usd=cost_usd,
                latency_ms=latency_ms,
                status_code=200 if is_success else 500,
                is_success=is_success,
                error_message=error_message
            )
            
            # Increment provider cumulative counters
            AIProviderConfig.objects.filter(provider=provider).update(
                total_tokens_used=AIProviderConfig.objects.filter(provider=provider).values_list('total_tokens_used', flat=True).first() or 0 + tokens_used
            )
        except Exception as e:
            logger.error(f"Failed to record AI inference log: {e}")

    @classmethod
    def execute_with_failover(cls, method_name: str, *args, **kwargs) -> Dict[str, Any]:
        """
        Executes an AI provider method with automatic fallback to secondary provider
        if the primary provider encounters network error or rate limit.
        """
        primary = cls.get_active_provider()
        start = time.time()
        try:
            method = getattr(primary, method_name)
            res = method(*args, **kwargs)
            cls.log_inference(
                provider=res.get('provider', 'gemini'),
                model=res.get('model_version', 'gemini-2.5-flash'),
                endpoint=method_name,
                tokens_used=res.get('tokens_used', 300),
                latency_ms=res.get('latency_ms', int((time.time() - start) * 1000)),
                is_success=True,
                cost_usd=res.get('cost_usd', 0.0001)
            )
            return res
        except Exception as err:
            logger.error(f"Primary AI provider {primary.model_name} failed: {err}. Initiating fallback.")
            fallback = GeminiProvider(model_name='gemini-2.5-flash')
            try:
                method = getattr(fallback, method_name)
                res = method(*args, **kwargs)
                cls.log_inference(
                    provider='gemini',
                    model='gemini-2.5-flash-fallback',
                    endpoint=method_name,
                    tokens_used=res.get('tokens_used', 250),
                    latency_ms=int((time.time() - start) * 1000),
                    is_success=True,
                    cost_usd=res.get('cost_usd', 0.00008)
                )
                res['fallback_engaged'] = True
                return res
            except Exception as fallback_err:
                cls.log_inference(
                    provider='gemini',
                    model='gemini-2.5-flash',
                    endpoint=method_name,
                    tokens_used=0,
                    latency_ms=int((time.time() - start) * 1000),
                    is_success=False,
                    error_message=str(fallback_err)
                )
                raise
