from flask import Blueprint, request, jsonify
from bson import ObjectId
from .db import leads_collection 

lead_bp = Blueprint("lead_bp", __name__)

def serialize(lead):
    lead["_id"] = str(lead["_id"])
    return lead

# Route for GET /api/leads (fetch all leads)
@lead_bp.route("/leads", methods=["GET"])
def get_all_leads():
    leads = list(leads_collection.find({}))
    return jsonify([serialize(lead) for lead in leads])

# Route for POST /api/leads (create a new lead)
@lead_bp.route("/leads", methods=["POST"])
def create_lead():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400
    result = leads_collection.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return jsonify(data), 201 # Return 201 Created status

# Route for PUT /api/leads/<lead_id> and DELETE /api/leads/<lead_id>
@lead_bp.route("/leads/<string:lead_id>", methods=["PUT", "DELETE"])
def manage_single_lead(lead_id):
    if request.method == "PUT":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        leads_collection.update_one({"_id": ObjectId(lead_id)}, {"$set": data})
        return jsonify({"success": True, "message": "Lead updated successfully"})
    elif request.method == "DELETE":
        leads_collection.delete_one({"_id": ObjectId(lead_id)})
        return jsonify({"success": True, "message": "Lead deleted successfully"})

