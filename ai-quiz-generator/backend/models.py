from typing import List, Dict, Optional
from pydantic import BaseModel, Field, HttpUrl


class KeyEntities(BaseModel):
    people: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)


class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    answer: str
    difficulty: str = Field(pattern=r"^(easy|medium|hard)$")
    explanation: str
    section: Optional[str] = None  # Optional section name for grouping


class QuizOutput(BaseModel):
    url: Optional[HttpUrl] = None
    title: str
    summary: str
    key_entities: KeyEntities
    sections: List[str] = Field(default_factory=list)
    quiz: List[QuizQuestion] = Field(min_length=5, max_length=10)
    related_topics: List[str] = Field(default_factory=list)
    cached: Optional[bool] = False  # Indicates if this is a cached result


class GenerateQuizRequest(BaseModel):
    url: HttpUrl


class HistoryItem(BaseModel):
    id: int
    url: str
    title: str
    date_generated: str


class UrlPreview(BaseModel):
    title: str
    valid: bool



