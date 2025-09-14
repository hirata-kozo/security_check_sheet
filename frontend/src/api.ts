const API_BASE_URL = "/api";

export async function sendPromptWithFiles(
  prompt: string,
  files: FileList | null
) {
  const formData = new FormData();
  formData.append("prompt", prompt);

  if (files) {
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  }

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "送信エラー");
  }

  return res.json();
}
