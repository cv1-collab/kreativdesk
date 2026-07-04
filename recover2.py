import json
import re

log_path = "/Users/carlo/.gemini/antigravity-ide/brain/b208d33f-f093-4c8a-82ae-8aedd081be46/.system_generated/logs/transcript_full.jsonl"
file_path = "/Users/carlo/Desktop/BackUp App 300626/Kreativ Desk V2_0/src/components/CompanyDashboard.tsx"

with open(file_path, "r") as f:
    content = f.read()

def apply_replace(content, target, replacement):
    # exact string replacement
    return content.replace(target, replacement)

with open(log_path, "r") as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get("type") == "PLANNER_RESPONSE" and "tool_calls" in step:
                if step["step_index"] > 1490: # skip my own broken edits
                    continue
                for tc in step["tool_calls"]:
                    name = tc.get("name")
                    args = tc.get("args", {})
                    target_file = args.get("TargetFile", "")
                    if "CompanyDashboard.tsx" in target_file:
                        if name == "replace_file_content":
                            t = args["TargetContent"]
                            r = args["ReplacementContent"]
                            content = apply_replace(content, t, r)
                            print(f"Applied replace at step {step['step_index']}")
                        elif name == "multi_replace_file_content":
                            chunks = args.get("ReplacementChunks", "[]")
                            if isinstance(chunks, str):
                                chunks = json.loads(chunks)
                            for chunk in chunks:
                                t = chunk["TargetContent"]
                                r = chunk["ReplacementContent"]
                                content = apply_replace(content, t, r)
                            print(f"Applied multi_replace at step {step['step_index']}")
        except Exception as e:
            pass

with open(file_path, "w") as f:
    f.write(content)

print("Done recovering!")
