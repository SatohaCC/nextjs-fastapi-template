"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { Alert } from "@/shared/ui/alert/Alert";
import { Button } from "@/shared/ui/button/Button";
import { RadioGroup } from "@/shared/ui/radio-group/RadioGroup";
import { TextField } from "@/shared/ui/text-field/TextField";
import { Textarea } from "@/shared/ui/textarea/Textarea";
import { taskCreateFormStyles as s } from "./TaskCreateForm.styles";
import { extractFieldErrorMessage, type TaskCreateInput, type TaskPriority } from "./tasksApi";

const PRIORITY_ITEMS = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
] as const;

export interface TaskCreateFormProps {
  isSubmitting: boolean;
  onCreate: (input: TaskCreateInput) => Promise<void>;
}

/** 新規タスクを作成するフォームコンポーネント。 */
export function TaskCreateForm({ isSubmitting, onCreate }: TaskCreateFormProps) {
  const headingId = useId();
  const titleId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("タイトルを入力してください");
      document.getElementById(titleId)?.focus();
      return;
    }

    setTitleError(null);
    try {
      await onCreate({
        title: trimmedTitle,
        description: description.trim(),
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
    } catch (error) {
      const fieldError = extractFieldErrorMessage(error, "title");
      if (fieldError) {
        setTitleError(fieldError);
        document.getElementById(titleId)?.focus();
        return;
      }
      setSubmitError(error instanceof Error ? error.message : "タスクの作成に失敗しました。");
    }
  };

  return (
    <div {...stylex.props(s.card)}>
      <div {...stylex.props(s.header)}>
        <h2 id={headingId} {...stylex.props(s.heading)}>
          タスクを作成
        </h2>
        <p {...stylex.props(s.requiredNote)}>「*」は必須項目です。</p>
      </div>

      <form
        aria-labelledby={headingId}
        onSubmit={handleSubmit}
        noValidate
        {...stylex.props(s.form)}
      >
        {submitError && (
          <Alert tone="error" title="作成できませんでした">
            {submitError}
          </Alert>
        )}

        <TextField
          id={titleId}
          label="タイトル"
          name="title"
          required
          maxLength={120}
          placeholder="例: SQLite 永続化の動作確認"
          value={title}
          onValueChange={(nextValue) => {
            setTitle(nextValue);
            if (titleError) {
              setTitleError(null);
            }
          }}
          errorMessage={titleError ?? undefined}
        />

        <Textarea
          label="詳細メモ"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="補足手順や確認観点があれば入力してください。"
          value={description}
          onValueChange={setDescription}
        />

        <RadioGroup
          label="優先度"
          name="priority"
          orientation="horizontal"
          items={PRIORITY_ITEMS}
          value={priority}
          onValueChange={(nextValue) => {
            if (nextValue === "low" || nextValue === "medium" || nextValue === "high") {
              setPriority(nextValue);
            }
          }}
        />

        <div {...stylex.props(s.actions)}>
          <Button type="submit" variant="filled" disabled={isSubmitting}>
            {isSubmitting ? "作成中..." : "タスクを追加"}
          </Button>
        </div>
      </form>
    </div>
  );
}
