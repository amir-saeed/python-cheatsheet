from sqlmodel import SQLModel
from connection import engine

def create_db_an_tables():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    create_db_an_tables()