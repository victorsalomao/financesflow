import json
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from openai import AsyncOpenAI
from pydantic import BaseModel, field_validator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FinanceFlow IA", docs_url=None, redoc_url=None)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CATEGORIAS = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Lazer",
    "Educação",
    "Vestuário",
    "Receita",
    "Outros",
]

CATEGORIAS_SET = set(CATEGORIAS)

PROMPT_SISTEMA = """Você é um classificador de transações financeiras pessoais brasileiras.
Classifique a transação em UMA das categorias disponíveis e retorne JSON com dois campos:
- "categoria": string com exatamente o nome da categoria (case-sensitive)
- "confianca": número float entre 0.0 e 1.0 indicando sua certeza

Critérios de classificação:
- Alimentação: supermercado, restaurante, delivery, padaria, açougue, hortifruti
- Transporte: combustível, Uber, 99, ônibus, metrô, estacionamento, pedágio, manutenção veículo
- Moradia: aluguel, condomínio, luz, água, gás, internet, TV, limpeza, reforma
- Saúde: farmácia, médico, dentista, plano de saúde, academia, suplementos
- Lazer: cinema, shows, viagens, assinaturas de streaming, jogos, bares, festas
- Educação: escola, faculdade, cursos, livros, material escolar
- Vestuário: roupas, calçados, acessórios, joias
- Receita: salário, freelance, venda, transferência recebida, rendimento
- Outros: qualquer coisa que não se encaixe nas categorias acima

Responda APENAS com JSON válido, sem markdown, sem texto adicional."""


class CategorizarInput(BaseModel):
    descricao: str
    valor: float

    @field_validator("descricao")
    @classmethod
    def descricao_nao_vazia(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("descricao não pode ser vazia")
        return v


class CategorizarResposta(BaseModel):
    categoria: str
    confianca: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/categorizar", response_model=CategorizarResposta)
async def categorizar(body: CategorizarInput):
    categorias_str = ", ".join(CATEGORIAS)
    mensagem_usuario = (
        f"Categorias disponíveis: {categorias_str}\n\n"
        f"Transação:\n"
        f"- Descrição: {body.descricao}\n"
        f"- Valor: R$ {body.valor:.2f}"
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": PROMPT_SISTEMA},
                {"role": "user", "content": mensagem_usuario},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=80,
        )

        content = response.choices[0].message.content or "{}"
        resultado = json.loads(content)

        categoria = resultado.get("categoria", "Outros")
        if categoria not in CATEGORIAS_SET:
            logger.warning("Categoria inválida retornada pela IA: %s — usando Outros", categoria)
            categoria = "Outros"

        confianca = float(resultado.get("confianca", 0.5))
        confianca = max(0.0, min(1.0, confianca))

        return CategorizarResposta(categoria=categoria, confianca=confianca)

    except json.JSONDecodeError as e:
        logger.error("Resposta da IA não é JSON válido: %s", e)
        return CategorizarResposta(categoria="Outros", confianca=0.0)

    except Exception as e:
        logger.error("Erro ao chamar OpenAI: %s", e)
        return CategorizarResposta(categoria="Outros", confianca=0.0)
