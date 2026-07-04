import json

log_path = "/Users/carlo/.gemini/antigravity-ide/brain/b208d33f-f093-4c8a-82ae-8aedd081be46/.system_generated/logs/transcript_full.jsonl"
with open(log_path, "r") as f:
    lines = f.readlines()

for line in lines:
    try:
        step = json.loads(line)
        if step.get("type") == "PLANNER_RESPONSE" and "tool_calls" in step:
            for tc in step["tool_calls"]:
                name = tc.get("name")
                args = tc.get("args", {})
                target_file = args.get("TargetFile", "")
                if "CompanyDashboard.tsx" in target_file:
                    print(f"Found {name} at step {step['step_index']}")
                    if name == "replace_file_content" or name == "multi_replace_file_content":
                        print("Instructions:", args.get("Instruction"))
    except:
        pass
