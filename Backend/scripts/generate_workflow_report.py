import json
import xml.etree.ElementTree as ET
import os

RESULTS_DIR = "results/"
SUMMARY_FILE = RESULTS_DIR + "workflow-report.md"
CDK_DEPLOY_LOG = RESULTS_DIR + "cdk-deploy/cdk-deploy.log"

TEST_FILES = {
    "Unit Tests": "unit-results/unit-results.xml",
    "CDK Tests": "cdk-results/cdk-results.xml",
    "Integration Tests": "integration-results/integration-results.xml",
    "E2E Tests": "e2e-results/e2e-results.xml",
}

COVERAGE_FILES = {
    "Unit Tests": "unit-coverage/coverage.xml",
    "Integration Tests": "integration-coverage/coverage.xml",
    "E2E Tests": "integration-coverage/coverage.xml",
    "CDK Tests": "cdk-coverage/coverage.xml",
}

STATIC_ANALYSIS_FILES = {
    "Flake8": "static-analysis/flake8.txt",
    "Mypy": "static-analysis/mypy.txt",
    "Bandit": "static-analysis/bandit.json",
}

def parse_flake8_log(file_path):
    """Parse Flake8 linting log."""
    if not os.path.exists(file_path):
        return "⚠️ No Flake8 issues found.\n"

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines:
        return "✅ No linting issues found."

    summary_index = next((i for i, line in enumerate(lines) if line[0].isdigit()), len(lines))
    issues = lines[:summary_index]
    summary = lines[summary_index:]

    formatted_summary= "\n".join([f"- {line.strip()}" for line in summary])
    formatted_issues = "\n".join([f"<li>{line.strip()}</li>" for line in issues])
    formatted_issues = f"""
        <details>
            <summary> Issues:</summary>
            <ul>
{formatted_issues}
            </ul>
        </details>
        """.strip() if issues else ""

    return formatted_summary +"\n"+ formatted_issues


def parse_mypy_log(file_path):
    """Parse Mypy type checking log."""
    if not os.path.exists(file_path):
        return "⚠️ No Mypy type issues found.\n"

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines:
        return "✅ No type issues found."

    summary = str(lines[-1]).strip()
    if len(lines) == 1:
        return summary

    formatted_issues = "\n".join([f"<li>{line.strip()}</li>" for line in lines[:-1]])

    return f"""
            <details>
                <summary> {summary}</summary>
                <ul>
{formatted_issues}
                </ul>   
            </details>
            """.strip()


def parse_bandit_log(file_path):
    """Parse Bandit security scan results."""
    if not os.path.exists(file_path):
        return "⚠️ No security issues found.\n"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        issues = data.get("results", [])
        if not issues:
            return "✅ No security vulnerabilities found."

        summary = f"❌ {len(issues)} security issues found:\n"
        formatted_issues = "\n".join(
            [f"<li>{issue['test_id']} ({issue['issue_severity']}): {issue['issue_text']}</li>" for issue in issues]
        )

        return f"""
                <details>
                    <summary> {summary}</summary>
                    <ul>
{formatted_issues}
                    </ul>
                </details>
                """.strip()


    except Exception as e:
        return f"❌ Error parsing Bandit results: {str(e)}\n"

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

        testcases = "\n".join(
            [f"- {testcase.attrib.get('classname').split('.')[-1].capitalize()}: {testcase.attrib.get('time', 0.0)}s"
             for testcase in root]).strip()

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


def read_cdk_log(file_path, title):

    if not os.path.exists(file_path):
        return f"⚠️ {title} log not found.\n"

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

        outputs = lines[lines.index('Outputs:\n') + 1:lines.index('Stack ARN:\n')]
        outputs = [f'- {line.strip()}' for line in outputs]

        status = [line for line in lines if '✅  CdkStac' in line][0]
        time = [line for line in lines if 'Total time:' in line][0]

        return "\n### " + status + "\n#### " + time + "\n#### CDK Output:\n" + "\n".join(outputs)


def generate_summary():
    """Generate markdown summary from test results and CDK logs."""
    os.makedirs(RESULTS_DIR, exist_ok=True)

    with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
        f.write("# Workflow Summary\n\n")

        f.write("\n## 🔍 Static Analysis\n")
        for analysis_name, file_name in STATIC_ANALYSIS_FILES.items():
            path = RESULTS_DIR + file_name
            if not os.path.exists(path): continue

            f.write(f"### {analysis_name}\n")
            if "flake8" in file_name:
                f.write(parse_flake8_log(path) + "\n")
            elif "mypy" in file_name:
                f.write(parse_mypy_log(path) + "\n")
            elif "bandit" in file_name:
                f.write(parse_bandit_log(path) + "\n")

        f.write("\n## Testing\n")

        for test_name, file_name in TEST_FILES.items():
            path = RESULTS_DIR + file_name

            if not os.path.exists(path): continue
            f.write(f"### {test_name}\n")
            f.write(parse_test_results(path) + "\n")

            # Add coverage summary
            coverage_file = COVERAGE_FILES.get(test_name)
            if coverage_file:
                f.write("#### " + parse_coverage(RESULTS_DIR + coverage_file) + "\n")

        if not os.path.exists(CDK_DEPLOY_LOG):
            return

        # Add CDK Deployment Results
        f.write("\n## 🚀 CDK Deployment\n")

        f.write(read_cdk_log(CDK_DEPLOY_LOG, "CDK Deploy"))


if __name__ == "__main__":
    generate_summary()
    print(f"Test summary generated at {SUMMARY_FILE}")



