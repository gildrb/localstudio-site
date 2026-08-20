import { quantizationLabels } from "@/lib/huggingface";

const QUANTIZATION_TAGS = [
  "awq",
  "gptq",
  "gguf",
  "exl2",
  "fp8",
  "fp16",
  "bf16",
  "int8",
  "int4",
  "w4a16",
  "w8a16",
];

export function extractQuantizations(tags: string[]): string[] {
  const labels = quantizationLabels({ modelId: "", tags });
  if (labels.length) return labels;
  const normalized = new Set(tags.map((tag) => tag.toLowerCase()));
  const quantizations: string[] = [];
  for (const quantization of QUANTIZATION_TAGS) {
    if (normalized.has(quantization.toLowerCase())) quantizations.push(quantization.toUpperCase());
  }
  return quantizations;
}
