import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Debate from "@/models/Debate";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const debate = await Debate.findById(params.id);
    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }
    return NextResponse.json(debate);
  } catch (error) {
    console.error("Error fetching debate:", error);
    return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 });
  }
}

// ✅ **PATCH to update rubric scores & mark debate as completed**
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { scores, overallScore } = await req.json();

    const debate = await Debate.findById(params.id);
    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    console.log("Received Scores:", scores);
    console.log("Overall Score:", overallScore);

    // ✅ **Map the frontend scores correctly to the database schema**
    debate.rubricScores = {
      toneInflection: scores["Tone/Inflection"] || 0,
      information: scores["Information"] || 0,
      useOfFactsStatistics: scores["Use of Facts/Statistics"] || 0,
      organization: scores["Organization"] || 0,
      understandingOfTopic: scores["Understanding of Topic"] || 0,
    };

    debate.overallScore = overallScore;
    debate.completed = true; // ✅ Mark debate as completed

    await debate.save();

    return NextResponse.json({ message: "Debate updated successfully", debate });
  } catch (error) {
    console.error("Error updating debate:", error);
    return NextResponse.json({ error: "Failed to update debate" }, { status: 500 });
  }
}