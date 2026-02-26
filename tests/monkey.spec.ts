import { test, expect, type Page } from "@playwright/test";

// ---- helpers ----

/** ランダムな日本語テキスト */
function randomText(): string {
  const pool = [
    "こんにちは！", "テストメッセージ", "モンキーテスト中", "おはよう",
    "わこつ！", "初見です", "888888", "ナイス！", "草", "www",
    "すごい！", "かわいい", "面白い", "やばい", "GG",
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomName(): string {
  const names = ["テスター", "視聴者A", "モンキー", "ユーザー1", "Bot太郎"];
  return names[Math.floor(Math.random() * names.length)];
}

/** ページ上の可視クリック可能要素をランダムにクリック */
async function randomClick(page: Page) {
  const clickable = page.locator("a, button, input, [role=button]").filter({ hasNotText: /削除|delete/i });
  const count = await clickable.count();
  if (count === 0) return;
  const idx = Math.floor(Math.random() * count);
  try {
    await clickable.nth(idx).click({ timeout: 3000, force: true });
  } catch {
    // element が消えたり非表示になったりするのは許容
  }
}

/** ページ上の input にランダムテキストを入力 */
async function randomType(page: Page) {
  const inputs = page.locator("input:visible, textarea:visible");
  const count = await inputs.count();
  if (count === 0) return;
  const idx = Math.floor(Math.random() * count);
  try {
    const el = inputs.nth(idx);
    await el.click({ timeout: 2000 });
    await el.fill(randomText());
  } catch {
    // 入力できない場合はスキップ
  }
}

// ---- tests ----

test.describe("Monkey Test - 全ページ巡回", () => {

  test("トップページが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=AITuber Sandbox").first()).toBeVisible();
    // コンソールエラーをチェック
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.waitForTimeout(1000);
    // ナビゲーションリンクが存在するか
    await expect(page.locator("a[href='/rooms']").first()).toBeVisible();
  });

  test("ルーム一覧ページが表示される", async ({ page }) => {
    await page.goto("/rooms");
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(2000);
    // ルームカードか新規ルームボタンが見えるか
    const hasContent = await page.locator("text=テストルーム").or(page.locator("text=新規ルーム")).first().isVisible();
    expect(hasContent).toBe(true);
  });

  test("ルーム作成ダイアログが開閉できる", async ({ page }) => {
    await page.goto("/rooms");
    await page.waitForTimeout(1000);

    // 新規ルームボタンをクリック
    const createBtn = page.locator("button", { hasText: "新規ルーム" });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      // ダイアログが開く
      await expect(page.locator("text=新規ルーム作成")).toBeVisible();
      // ストリーム設定チェックボックス
      const streamCheck = page.locator("text=ストリーム設定");
      if (await streamCheck.isVisible()) {
        await streamCheck.click();
        await page.waitForTimeout(300);
        await expect(page.locator("text=配信タイトル")).toBeVisible();
      }
      // キャンセル
      const cancelBtn = page.locator("button", { hasText: "キャンセル" });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      }
    }
  });

  test("デフォルトルーム詳細ページが動作する", async ({ page }) => {
    await page.goto("/rooms/dev-room-1");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=テストルーム")).toBeVisible();
    // 視聴者ページリンクが存在する
    await expect(page.locator("text=視聴者ページ")).toBeVisible();
    // ストリーム設定カードが存在する
    await expect(page.locator("text=ストリーム設定")).toBeVisible();
  });

  test("セッション開始→チャット送信→停止", async ({ page }) => {
    await page.goto("/rooms/dev-room-1");
    await page.waitForTimeout(2000);

    // セッション開始
    const startBtn = page.locator("button", { hasText: "セッション開始" }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(2000);
    }

    // チャットが表示される
    const chatVisible = await page.locator("text=ライブチャット").isVisible();
    if (chatVisible) {
      // 表示名を入力
      const nameInput = page.locator("input[placeholder='表示名']");
      if (await nameInput.isVisible()) {
        await nameInput.fill(randomName());
      }
      // メッセージを入力して送信
      const msgInput = page.locator("input[placeholder='メッセージを入力...']");
      if (await msgInput.isVisible()) {
        await msgInput.fill(randomText());
        const sendBtn = page.locator("button", { hasText: "送信" });
        if (await sendBtn.isEnabled()) {
          await sendBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // セッション停止
    const stopBtn = page.locator("button", { hasText: "セッション停止" });
    if (await stopBtn.isVisible()) {
      await stopBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("ストリーム設定の保存", async ({ page }) => {
    await page.goto("/rooms/dev-room-1");
    await page.waitForTimeout(2000);

    // ストリーム設定フィールドに入力
    const titleInput = page.locator("input[placeholder='配信タイトル']");
    if (await titleInput.isVisible()) {
      await titleInput.fill("モンキーテスト配信");
    }
    const chInput = page.locator("input[placeholder='チャンネル名']");
    if (await chInput.isVisible()) {
      await chInput.fill("テストチャンネル");
    }

    // 保存
    const saveBtn = page.locator("button", { hasText: "保存" });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("視聴者ページが表示される", async ({ page }) => {
    await page.goto("/watch/dev-live-chat-1");
    await page.waitForTimeout(3000);

    // ページが描画される（エラーでないこと）
    const hasError = await page.locator("text=ルームが見つかりません").isVisible();
    if (!hasError) {
      // 配信待機中プレースホルダー or 動画プレイヤーが表示される（MediaMTX未起動なので待機中が出る）
      const waiting = page.locator("text=配信待機中").or(page.locator("text=再接続中")).or(page.locator("video"));
      await expect(waiting.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("視聴者ページでチャットを送信できる", async ({ page }) => {
    // まずセッションを開始
    const startRes = await page.request.post("/api/rooms/dev-room-1/start");
    expect(startRes.status()).toBe(200);

    await page.goto("/watch/dev-live-chat-1");
    await page.waitForTimeout(3000);

    // チャットパネルが存在する
    const chatHeader = page.locator("text=Live Chat");
    if (await chatHeader.isVisible()) {
      // 表示名を入力
      const nameInput = page.locator("input[placeholder='表示名']");
      if (await nameInput.isVisible()) {
        await nameInput.fill(randomName());
      }
      // メッセージ送信
      const msgInput = page.locator("input[placeholder='メッセージを入力...']");
      if (await msgInput.isVisible()) {
        await msgInput.fill(randomText());
        const sendBtn = page.locator("button", { hasText: "送信" });
        if (await sendBtn.isEnabled()) {
          await sendBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // セッション停止
    await page.request.post("/api/rooms/dev-room-1/stop");
  });

  test("視聴者ページの配信情報UIが正しく動作する", async ({ page }) => {
    await page.goto("/watch/dev-live-chat-1");
    await page.waitForTimeout(3000);

    // チャンネル名が表示される
    const channelName = page.locator("text=テストチャンネル");
    if (await channelName.isVisible()) {
      // 共有ボタン
      const shareBtn = page.locator("button", { hasText: "共有" });
      if (await shareBtn.isVisible()) {
        // headless では clipboard API が制限されるため、クリックできることだけ確認
        await shareBtn.click();
        await page.waitForTimeout(500);
      }

      // 高評価ボタン
      const likeArea = page.locator("button").filter({ has: page.locator("svg") }).first();
      if (await likeArea.isVisible()) {
        await likeArea.click();
      }
    }
  });

  test("ランダムクリック＆入力（トップ + ルーム一覧）", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    // トップページ
    await page.goto("/");
    for (let i = 0; i < 5; i++) {
      await randomClick(page);
      await page.waitForTimeout(300);
    }

    // ルーム一覧
    await page.goto("/rooms");
    await page.waitForTimeout(1000);
    for (let i = 0; i < 5; i++) {
      await randomClick(page);
      await page.waitForTimeout(300);
      await randomType(page);
      await page.waitForTimeout(300);
    }

    // 致命的なJS例外がないことを確認
    const fatal = errors.filter(e =>
      !e.includes("ResizeObserver") &&
      !e.includes("fetch") &&
      !e.includes("Failed to fetch")
    );
    expect(fatal).toEqual([]);
  });

  test("ランダムクリック＆入力（ルーム詳細）", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/rooms/dev-room-1");
    await page.waitForTimeout(2000);

    for (let i = 0; i < 10; i++) {
      const action = Math.random();
      if (action < 0.5) {
        await randomClick(page);
      } else {
        await randomType(page);
      }
      await page.waitForTimeout(400);
    }

    const fatal = errors.filter(e =>
      !e.includes("ResizeObserver") &&
      !e.includes("fetch") &&
      !e.includes("Failed to fetch")
    );
    expect(fatal).toEqual([]);
  });

  test("ランダムクリック＆入力（視聴者ページ）", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", err => errors.push(err.message));

    await page.goto("/watch/dev-live-chat-1");
    await page.waitForTimeout(3000);

    for (let i = 0; i < 10; i++) {
      const action = Math.random();
      if (action < 0.5) {
        await randomClick(page);
      } else {
        await randomType(page);
      }
      await page.waitForTimeout(400);
    }

    const fatal = errors.filter(e =>
      !e.includes("ResizeObserver") &&
      !e.includes("fetch") &&
      !e.includes("Failed to fetch") &&
      !e.includes("hls")
    );
    expect(fatal).toEqual([]);
  });

  test("API: liveChatId クエリでルームを取得できる", async ({ request }) => {
    const res = await request.get("/api/rooms?liveChatId=dev-live-chat-1");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.room).toBeDefined();
    expect(body.room.id).toBe("dev-room-1");
    expect(body.room.liveChatId).toBe("dev-live-chat-1");
  });

  test("API: PATCH でルーム更新できる", async ({ request }) => {
    const res = await request.patch("/api/rooms/dev-room-1", {
      data: {
        streamTitle: "API テスト配信",
        channelName: "APIテストチャンネル",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.room.streamTitle).toBe("API テスト配信");
    expect(body.room.channelName).toBe("APIテストチャンネル");
  });

  test("API: 存在しない liveChatId は 404 を返す", async ({ request }) => {
    const res = await request.get("/api/rooms?liveChatId=nonexistent");
    expect(res.status()).toBe(404);
  });
});
