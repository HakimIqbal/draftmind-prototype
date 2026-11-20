"""E2E smoke test of the DraftMind prototype against the static export."""
import re, sys
from playwright.sync_api import sync_playwright, expect

BASE = "http://127.0.0.1:4174"
fails = []

def check(name, fn):
    try:
        fn()
        print(f"PASS {name}")
    except Exception as e:
        fails.append(name)
        print(f"FAIL {name}: {e}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(BASE + "/")

    # 1. Dashboard
    check("doc-list renders 3 seeded docs", lambda: expect(page.get_by_test_id("doc-list-item")).to_have_count(3))
    page.get_by_test_id("search-input").fill("Billing")
    check("search filters to 1", lambda: expect(page.get_by_test_id("doc-list-item")).to_have_count(1))
    page.get_by_test_id("search-input").fill("zzzz-no-match")
    check("no-match empty state", lambda: expect(page.get_by_test_id("empty-state")).to_be_visible())
    page.get_by_test_id("search-input").fill("")
    check("demo notice visible", lambda: expect(page.get_by_test_id("demo-notice")).to_be_visible())

    # 2. Wizard
    page.get_by_test_id("new-prd-button").click()
    page.wait_for_url("**/new")
    check("wizard step 1 visible", lambda: expect(page.get_by_test_id("wizard-step-1")).to_be_visible())
    page.get_by_test_id("wizard-next").click()
    check("validation blocks empty step 1", lambda: expect(page.get_by_test_id("wizard-step-1")).to_be_visible())
    check("inline error shown", lambda: expect(page.locator("#product-error")).to_be_visible())
    page.get_by_test_id("wizard-product-input").fill("DraftMind")
    page.get_by_test_id("wizard-title-input").fill("Collaborative Editing PRD")
    page.get_by_test_id("wizard-audience-input").fill("Product managers at SaaS teams")
    page.get_by_test_id("wizard-next").click()
    check("wizard step 2 visible", lambda: expect(page.get_by_test_id("wizard-step-2")).to_be_visible())
    page.get_by_test_id("wizard-summary-input").fill("short")
    page.get_by_test_id("wizard-next").click()
    check("short summary blocked", lambda: expect(page.get_by_test_id("wizard-step-2")).to_be_visible())
    page.get_by_test_id("wizard-summary-input").fill("Real-time collaborative editing with presence, comments, and version history for product teams.")
    page.get_by_test_id("wizard-next").click()
    check("wizard step 3 review", lambda: expect(page.get_by_test_id("wizard-step-3")).to_be_visible())
    page.get_by_test_id("wizard-back").click()
    check("back keeps state", lambda: expect(page.get_by_test_id("wizard-summary-input")).to_have_value(re.compile("Real-time")))
    page.get_by_test_id("wizard-next").click()
    page.get_by_test_id("wizard-submit").click()
    page.wait_for_url("**/editor?id=*")
    check("routed to editor", lambda: expect(page.get_by_test_id("doc-title-input")).to_have_value("Collaborative Editing PRD"))
    doc_url = page.url

    # 3. Editor
    check("4 sections created", lambda: expect(page.get_by_test_id("section-card")).to_have_count(4))
    page.get_by_test_id("doc-title-input").fill("Collaborative Editing PRD v2")
    # reorder: move first section down
    page.get_by_test_id("section-move-down").first.click()
    kinds = page.get_by_test_id("section-card").evaluate_all("els => els.map(e => e.dataset.sectionKind)")
    check("reorder works", lambda: (_ for _ in ()).throw(Exception(f"order {kinds}")) if kinds[0] != "goals" else None)
    # add + remove section
    page.get_by_test_id("add-section-kind").select_option("metrics")
    page.get_by_test_id("add-section-button").click()
    check("add section -> 5", lambda: expect(page.get_by_test_id("section-card")).to_have_count(5))
    page.get_by_test_id("section-remove-button").last.click()
    check("remove section -> 4", lambda: expect(page.get_by_test_id("section-card")).to_have_count(4))
    # AI streaming
    page.get_by_test_id("ai-kind-select").select_option("problem")
    page.get_by_test_id("ai-assist-button").click()
    check("ai-output appears", lambda: expect(page.get_by_test_id("ai-output")).to_be_visible())
    expect(page.get_by_test_id("ai-apply-button")).to_be_visible(timeout=15000)
    page.get_by_test_id("ai-apply-button").click()
    check("toast confirms apply", lambda: expect(page.get_by_test_id("toast").first).to_be_visible())
    problem_body = page.locator('[data-section-kind="problem"] [data-testid="section-body-input"]').input_value()
    check("AI text applied", lambda: (_ for _ in ()).throw(Exception(f"empty body: {problem_body!r}")) if len(problem_body) < 100 else None)
    # versions
    page.get_by_test_id("version-history-button").click()
    check("version panel visible", lambda: expect(page.get_by_test_id("version-panel")).to_be_visible())
    page.get_by_test_id("version-snapshot-button").click()
    page.wait_for_timeout(100)
    page.get_by_test_id("doc-title-input").fill("TEMP TITLE TO RESTORE AWAY")
    page.wait_for_timeout(100)
    page.get_by_test_id("version-restore-button").first.click()
    check("restore reverts title", lambda: expect(page.get_by_test_id("doc-title-input")).to_have_value("Collaborative Editing PRD v2"))
    # persistence across reload
    page.wait_for_timeout(600)
    page.goto(doc_url)
    check("reload persists title", lambda: expect(page.get_by_test_id("doc-title-input")).to_have_value("Collaborative Editing PRD v2"))
    check("reload persists versions", lambda: expect(page.get_by_test_id("version-history-button")).to_be_visible())

    # 4. Export
    page.get_by_test_id("export-button").click()
    check("export modal opens", lambda: expect(page.get_by_test_id("export-modal")).to_be_visible())
    check("focus trapped in modal", lambda: (_ for _ in ()).throw(Exception("focus outside")) if not page.evaluate("document.querySelector('[data-testid=export-modal]').contains(document.activeElement)") else None)
    page.get_by_test_id("export-format-docx").check()
    page.get_by_test_id("export-confirm").click()
    check("export success", lambda: expect(page.get_by_test_id("export-success")).to_be_visible(timeout=10000))
    page.keyboard.press("Escape")
    check("Escape closes modal", lambda: expect(page.get_by_test_id("export-modal")).to_have_count(0))
    check("focus restored to export button", lambda: (_ for _ in ()).throw(Exception("focus not restored")) if page.evaluate("document.activeElement.dataset.testid") != "export-button" else None)
    # export error path
    page.get_by_test_id("export-button").click()
    page.get_by_test_id("export-failure-toggle").check()
    page.get_by_test_id("export-confirm").click()
    check("export error path", lambda: expect(page.get_by_test_id("export-error")).to_be_visible(timeout=10000))
    page.get_by_test_id("export-retry").click()
    check("retry succeeds", lambda: expect(page.get_by_test_id("export-success")).to_be_visible(timeout=10000))
    page.keyboard.press("Escape")

    # 5. Error/empty states
    page.goto(BASE + "/editor?id=does-not-exist")
    check("missing doc empty state", lambda: expect(page.get_by_test_id("empty-state")).to_be_visible())
    page.goto(BASE + "/")
    page.evaluate("localStorage.setItem('draftmind.docs.v1', '{corrupt')")
    page.reload()
    check("corrupt storage error state", lambda: expect(page.get_by_test_id("error-state")).to_be_visible())
    page.get_by_test_id("error-reset-button").click()
    check("reset recovers", lambda: expect(page.get_by_test_id("doc-list-item")).to_have_count(3))

    # 6. Mobile 375px
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE + "/new")
    page.get_by_test_id("wizard-product-input").fill("Mobile test")
    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    check("no horizontal overflow at 375px (wizard)", lambda: (_ for _ in ()).throw(Exception("overflow")) if overflow else None)
    page.goto(BASE + "/editor?id=demo-doc-draftmind")
    expect(page.get_by_test_id("doc-title-input")).to_be_visible()
    overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    check("no horizontal overflow at 375px (editor)", lambda: (_ for _ in ()).throw(Exception("overflow")) if overflow else None)
    check("mobile: ai button visible", lambda: expect(page.get_by_test_id("ai-assist-button")).to_be_visible())

    # 7. Keyboard-only pass on wizard
    page.set_viewport_size({"width": 1280, "height": 900})
    page.goto(BASE + "/new")
    page.get_by_test_id("wizard-product-input").focus()
    page.keyboard.type("Kbd Product")
    page.keyboard.press("Tab")
    page.keyboard.type("Keyboard Only PRD")
    page.keyboard.press("Tab")
    page.keyboard.type("Keyboard users everywhere")
    page.get_by_test_id("wizard-next").focus()
    page.keyboard.press("Enter")
    check("keyboard reaches step 2", lambda: expect(page.get_by_test_id("wizard-step-2")).to_be_visible())

    browser.close()

print(f"\n{'ALL PASS' if not fails else 'FAILURES: ' + ', '.join(fails)} ({len(fails)} failed)")
sys.exit(1 if fails else 0)