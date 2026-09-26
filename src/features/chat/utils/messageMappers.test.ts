import { describe, it, expect } from "vitest";
import { mapGreenApiMessage, mapHistory } from "./messageMappers";
import type { GreenApiMessage } from "../../../api/types";

const createMessage = (
  overrides: Partial<GreenApiMessage> = {}
): GreenApiMessage =>
  ({
    idMessage: "id-1",
    type: "outgoing",
    timestamp: 1700000000,
    textMessage: "hello",
    ...overrides,
  } as GreenApiMessage);

describe("mapGreenApiMessage", () => {
  it("мапит textMessage", () => {
    const result = mapGreenApiMessage(createMessage({ textMessage: "hi" }));

    expect(result).toEqual({
      id: "id-1",
      text: "hi",
      direction: "outgoing",
      timestamp: 1700000000,
      status: "sent",
    });
  });

  it("использует extendedTextMessage.text, если textMessage отсутствует", () => {
    const result = mapGreenApiMessage(
      createMessage({
        textMessage: undefined,
        extendedTextMessage: { text: "extended" },
      } as Partial<GreenApiMessage>)
    );

    expect(result?.text).toBe("extended");
  });

  it("предпочитает textMessage, а не extendedTextMessage", () => {
    const result = mapGreenApiMessage(
      createMessage({
        textMessage: "primary",
        extendedTextMessage: { text: "secondary" },
      } as Partial<GreenApiMessage>)
    );

    expect(result?.text).toBe("primary");
  });

  it("возвращает null, если текста нет", () => {
    const result = mapGreenApiMessage(
      createMessage({
        textMessage: undefined,
        extendedTextMessage: undefined,
      } as Partial<GreenApiMessage>)
    );

    expect(result).toBeNull();
  });

  it("возвращает null при пустой строке в extendedTextMessage", () => {
    const result = mapGreenApiMessage(
      createMessage({
        textMessage: undefined,
        extendedTextMessage: { text: "" },
      } as Partial<GreenApiMessage>)
    );

    expect(result).toBeNull();
  });
});

describe("mapHistory", () => {
  it("фильтрует null и разворачивает массив (reverse)", () => {
    const history = [
      createMessage({ idMessage: "1", textMessage: "first" }),
      createMessage({ idMessage: "2", textMessage: undefined } as Partial<GreenApiMessage>),
      createMessage({ idMessage: "3", textMessage: "third" }),
    ];

    const result = mapHistory(history);

    expect(result.map((m) => m.id)).toEqual(["3", "1"]);
    expect(result.map((m) => m.text)).toEqual(["third", "first"]);
  });

  it("возвращает пустой массив для пустого входа", () => {
    expect(mapHistory([])).toEqual([]);
  });

  it("возвращает пустой массив, если все сообщения без текста", () => {
    const history = [
      createMessage({ textMessage: undefined } as Partial<GreenApiMessage>),
      createMessage({ textMessage: undefined } as Partial<GreenApiMessage>),
    ];

    expect(mapHistory(history)).toEqual([]);
  });

  it("не мутирует исходный массив", () => {
    const history = [
      createMessage({ idMessage: "1" }),
      createMessage({ idMessage: "2" }),
    ];
    const snapshot = [...history];

    mapHistory(history);

    expect(history).toEqual(snapshot);
  });
});