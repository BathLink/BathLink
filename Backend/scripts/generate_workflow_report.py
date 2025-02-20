import xml.etree.ElementTree as ET
import os

SUMMARY_FILE = "workflow-report.md"
CDK_DEPLOY_LOG = "cdk-deploy.log"

TEST_FILES = {
    "Unit Tests": "unit-results.xml",
    "CDK Tests": "cdk-results.xml",
    "Integration Tests": "integration-results.xml",
    "E2E Tests": "e2e-results.xml",
}

COVERAGE_FILES = {
    "Unit Tests": "unit-coverage.xml",
    "Integration Tests": "integration-coverage.xml",
    "E2E Tests": "e2e-coverage.xml",
}

def parse_test_results(file_path):

    if not os.path.exists(file_path):
        return "⚠️ Test results not found.\n"

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()[0]
        tests = int(root.attrib.get("tests", 0))
        failures = int(root.attrib.get("failures", 0))
        errors = int(root.attrib.get("errors", 0))
        skipped = int(root.attrib.get("skipped", 0))

        testcases = "\n".join([f"- {testcase.attrib.get('classname').split('.')[-1].capitalize()}: {testcase.attrib.get('time',0.0)}s" for testcase in root]).strip()

        return f"""
        <details>
          <summary> ✅ Total: {tests}, ❌ Failures: {failures}, ⚠️ Errors: {errors}, ⏭ Skipped: {skipped}</summary>
          \n{testcases}
        </details>
        """.strip()
    except Exception as e:
        return f"❌ Error parsing results: {str(e)}\n"

def parse_coverage(file_path):
    if not os.path.exists(file_path):
        return "⚠️ Coverage report not found.\n"

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        line_rate = float(root.attrib.get("line-rate", 0)) * 100
        return f"Coverage: {line_rate:.2f}%"
    except Exception as e:
        return f"❌ Error parsing coverage: {str(e)}\n"

def read_cdk_log(file_path, title, max_lines=20):
    """Read the last few lines of a CDK log file."""
    if not os.path.exists(file_path):
        return f"⚠️ {title} log not found.\n"


    with open(file_path, "r", encoding="utf-16le") as f:
        lines = f.readlines()
        outputs = lines[lines.index('Outputs:\n')+1:lines.index('Stack ARN:\n')]
        outputs = [f'- {line.strip()}' for line in outputs]

        status = [line for line in lines if '✅  CdkStac' in line][0]
        time = [line for line in lines if 'Total time:' in line][0]


        return "\n### "+status+"\n#### "+time+"\n#### CDK Output:\n"+"\n".join(outputs)

def generate_summary():

    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        f.write("# Workflow Summary\n\n")

        f.write("\n## Testing\n")

        for test_name, file_name in TEST_FILES.items():
    

            if not os.path.exists(file_name): continue
            f.write(f"### {test_name}\n")
            f.write(parse_test_results(file_name) + "\n")

            # Add coverage summary
            coverage_file = COVERAGE_FILES.get(test_name)
            if coverage_file:
                f.write(parse_coverage(coverage_file) + "\n")

        if not os.path.exists(CDK_DEPLOY_LOG):
            return

        # Add CDK Deployment Results
        f.write("\n## 🚀 CDK Deployment\n")

        f.write(read_cdk_log(CDK_DEPLOY_LOG, "CDK Deploy"))


if __name__ == "__main__":
    generate_summary()
    print(f"Test summary generated at {SUMMARY_FILE}")
