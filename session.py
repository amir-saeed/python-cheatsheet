from connection import engine
from sqlmodel import Session
from fastapi import Depends
from typing import Annotated

def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]