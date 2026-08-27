import { describe, expect, it } from "vitest";
import { ImportError, importFileToDoc, titleFromFilename } from "@/lib/import-file";

describe("importFileToDoc", () => {
  it("accepts a .txt file and splits blank-line-separated paragraphs", () => {
    const { title, doc } = importFileToDoc({
      filename: "my-notes.txt",
      size: 20,
      content: "First para.\n\nSecond para.",
    });
    expect(title).toBe("my notes");
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0].type).toBe("paragraph");
  });

  it("accepts a .md file and converts headings, bold and lists", () => {
    const { doc } = importFileToDoc({
      filename: "readme.md",
      size: 40,
      content: "# Title\n\nSome **bold** text.\n\n- one\n- two",
    });
    const types = doc.content.map((n) => n.type);
    expect(types).toContain("heading");
    expect(types).toContain("bulletList");
    const para = doc.content.find((n) => n.type === "paragraph");
    const boldRun = para?.content?.find((c) => c.marks?.some((m) => m.type === "bold"));
    expect(boldRun).toBeTruthy();
  });

  it("rejects an unsupported extension", () => {
    expect(() =>
      importFileToDoc({ filename: "photo.png", size: 10, content: "x" }),
    ).toThrowError(ImportError);
  });

  it("rejects an oversized file", () => {
    try {
      importFileToDoc({ filename: "big.txt", size: 2 * 1024 * 1024, content: "x" });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as ImportError).code).toBe("FILE_TOO_LARGE");
    }
  });

  it("rejects an empty file", () => {
    try {
      importFileToDoc({ filename: "empty.md", size: 0, content: "   \n  " });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as ImportError).code).toBe("EMPTY_FILE");
    }
  });
});

describe("titleFromFilename", () => {
  it("strips path, extension and separators", () => {
    expect(titleFromFilename("docs/quarterly_report.final.md")).toBe("quarterly report.final");
  });
});
