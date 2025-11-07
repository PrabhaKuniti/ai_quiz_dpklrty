from __future__ import annotations

import os
from typing import Any, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import Runnable
from .models import QuizOutput


def _build_parser() -> PydanticOutputParser:
    return PydanticOutputParser(pydantic_object=QuizOutput)


def _build_model() -> ChatGoogleGenerativeAI:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment")
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-exp",
        temperature=0.2,
        convert_system_message_to_human=True,
        api_key=api_key,
    )


def _build_prompt(parser: PydanticOutputParser) -> ChatPromptTemplate:
    format_instructions = parser.get_format_instructions()
    template = (
        "You are an expert educational content creator. Given a Wikipedia article, "
        "produce a rigorous study summary and a multiple-choice quiz grounded ONLY in the provided text.\n\n"
        "Requirements:\n"
        "- Generate 5 to 10 high-quality questions spanning easy/medium/hard.\n"
        "- Each question MUST have exactly 4 options.\n"
        "- The 'answer' must be one of the provided options.\n"
        "- Include a short evidence-based explanation referencing the relevant section.\n"
        "- For each question, include a 'section' field indicating which section of the article it relates to (e.g., 'Early Life', 'Career', 'Achievements'). Use the section names from the 'sections' list when possible.\n"
        "- Extract key_entities (people, organizations, locations), sections, and related_topics.\n"
        "- Avoid hallucinations. If unavailable in the text, omit or state 'not specified'.\n\n"
        "Return the output that strictly follows this JSON schema:\n{format_instructions}\n\n"
        "Article title: {title}\n"
        "Article text (cleaned):\n{article_text}\n"
    )
    return ChatPromptTemplate.from_template(template)


def build_quiz_chain() -> Runnable:
    parser = _build_parser()
    model = _build_model()
    prompt = _build_prompt(parser)
    chain: Runnable = prompt | model | parser
    return chain


def generate_quiz_payload(url: str, title: str, article_text: str) -> Dict[str, Any]:
    chain = build_quiz_chain()
    result: QuizOutput = chain.invoke({
        "title": title,
        "article_text": article_text,
        "format_instructions": _build_parser().get_format_instructions(),
    })
    # Convert to plain JSON-serializable types
    data = result.model_dump(mode="json")
    data["url"] = str(url)
    return data


