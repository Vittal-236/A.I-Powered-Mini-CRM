from pymongo import MongoClient
import os


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Create connection
client = MongoClient(MONGO_URI)

# Select DB and collection
db = client["mini_crm"]
leads_collection = db["leads"]
reminders_collection = db["reminders"]