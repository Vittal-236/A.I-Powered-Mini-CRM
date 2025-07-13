from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from .db import reminders_collection, leads_collection
import traceback

reminders_bp = Blueprint("reminders", __name__)

@reminders_bp.route("/reminders", methods=["GET"])
def get_reminders():
    """Get all reminders, optionally filtered by lead_id"""
    try:
        lead_id = request.args.get("lead_id")
        
        # Build query filter
        query = {}
        if lead_id:
            query["lead_id"] = lead_id
        
        # Get reminders from database
        reminders = list(reminders_collection.find(query).sort("reminder_date", 1))
        
        # Convert ObjectId to string for JSON serialization
        for reminder in reminders:
            reminder["_id"] = str(reminder["_id"])
        
        return jsonify({
            "success": True,
            "reminders": reminders
        })
    
    except Exception as e:
        print(f"Error fetching reminders: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders", methods=["POST"])
def create_reminder():
    """Create a new reminder"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["title", "reminder_date", "lead_id"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate lead_id exists
        lead = leads_collection.find_one({"_id": ObjectId(data["lead_id"])})
        if not lead:
            return jsonify({"error": "Lead not found"}), 404
        
        # Parse reminder date
        try:
            reminder_date = datetime.fromisoformat(data["reminder_date"].replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        
        # Create reminder document
        reminder = {
            "title": data["title"],
            "description": data.get("description", ""),
            "reminder_date": reminder_date,
            "lead_id": data["lead_id"],
            "lead_name": lead.get("name", "Unknown"),
            "type": data.get("type", "general"),  # general, call, meeting, follow_up
            "status": "pending",  # pending, completed, dismissed
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = reminders_collection.insert_one(reminder)
        reminder["_id"] = str(result.inserted_id)
        
        return jsonify({
            "success": True,
            "reminder": reminder,
            "message": "Reminder created successfully"
        }), 201
    
    except Exception as e:
        print(f"Error creating reminder: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/<reminder_id>", methods=["PUT"])
def update_reminder(reminder_id):
    """Update an existing reminder"""
    try:
        data = request.get_json()
        
        # Validate reminder exists
        reminder = reminders_collection.find_one({"_id": ObjectId(reminder_id)})
        if not reminder:
            return jsonify({"error": "Reminder not found"}), 404
        
        # Build update document
        update_data = {"updated_at": datetime.utcnow()}
        
        # Update allowed fields
        allowed_fields = ["title", "description", "reminder_date", "type", "status"]
        for field in allowed_fields:
            if field in data:
                if field == "reminder_date":
                    try:
                        update_data[field] = datetime.fromisoformat(data[field].replace("Z", "+00:00"))
                    except ValueError:
                        return jsonify({"error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
                else:
                    update_data[field] = data[field]
        
        # Update in database
        reminders_collection.update_one(
            {"_id": ObjectId(reminder_id)},
            {"$set": update_data}
        )
        
        # Get updated reminder
        updated_reminder = reminders_collection.find_one({"_id": ObjectId(reminder_id)})
        updated_reminder["_id"] = str(updated_reminder["_id"])
        
        return jsonify({
            "success": True,
            "reminder": updated_reminder,
            "message": "Reminder updated successfully"
        })
    
    except Exception as e:
        print(f"Error updating reminder: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/<reminder_id>", methods=["DELETE"])
def delete_reminder(reminder_id):
    """Delete a reminder"""
    try:
        # Validate reminder exists
        reminder = reminders_collection.find_one({"_id": ObjectId(reminder_id)})
        if not reminder:
            return jsonify({"error": "Reminder not found"}), 404
        
        # Delete from database
        reminders_collection.delete_one({"_id": ObjectId(reminder_id)})
        
        return jsonify({
            "success": True,
            "message": "Reminder deleted successfully"
        })
    
    except Exception as e:
        print(f"Error deleting reminder: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/upcoming", methods=["GET"])
def get_upcoming_reminders():
    """Get upcoming reminders (next 7 days)"""
    try:
        from datetime import timedelta
        
        # Calculate date range
        now = datetime.utcnow()
        next_week = now + timedelta(days=7)
        
        # Query upcoming reminders
        reminders = list(reminders_collection.find({
            "reminder_date": {"$gte": now, "$lte": next_week},
            "status": {"$ne": "completed"}
        }).sort("reminder_date", 1))
        
        # Convert ObjectId to string
        for reminder in reminders:
            reminder["_id"] = str(reminder["_id"])
        
        return jsonify({
            "success": True,
            "reminders": reminders,
            "count": len(reminders)
        })
    
    except Exception as e:
        print(f"Error fetching upcoming reminders: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/<reminder_id>/complete", methods=["POST"])
def complete_reminder(reminder_id):
    """Mark a reminder as completed"""
    try:
        # Validate reminder exists
        reminder = reminders_collection.find_one({"_id": ObjectId(reminder_id)})
        if not reminder:
            return jsonify({"error": "Reminder not found"}), 404
        
        # Update status to completed
        reminders_collection.update_one(
            {"_id": ObjectId(reminder_id)},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        return jsonify({
            "success": True,
            "message": "Reminder marked as completed"
        })
    
    except Exception as e:
        print(f"Error completing reminder: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500