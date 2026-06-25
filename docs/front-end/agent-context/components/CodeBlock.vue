<template>
  <div ref="container" class="code-block" />
</template>

<script setup lang="ts">
import { type editor as Editor } from 'monaco-editor';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

interface Props {
  code: string;
  language?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript'
});

const container = ref<HTMLElement | null>(null);
let editor: Editor.IStandaloneCodeEditor | null = null;
let disposed = false;
let mounted = false;

async function createEditor() {
  if (!mounted || !container.value || !props.code || disposed) return;

  editor?.dispose();
  editor = null;

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    }
  };

  const monaco = await import('monaco-editor');

  if (disposed || !container.value) return;

  editor = monaco.editor.create(container.value, {
    value: props.code,
    language: props.language,
    theme: 'vs-dark',
    readOnly: true,
    domReadOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 4,
    lineNumbersMinChars: 0,
    renderLineHighlight: 'none',
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'auto',
      handleMouseWheel: false
    },
    fontSize: 11,
    lineHeight: 16,
    padding: { top: 6, bottom: 6 }
  });

  await nextTick();
  if (!editor || !container.value) return;

  const lineCount = editor.getModel()?.getLineCount() || 1;
  const height = lineCount * 16 + 12; // 16px lineHeight + padding
  container.value.style.height = `${height}px`;
  editor.layout();
}

onMounted(() => {
  mounted = true;
  createEditor();
});

watch(
  () => props.code,
  () => {
    if (mounted) createEditor();
  }
);

onUnmounted(() => {
  disposed = true;
  editor?.dispose();
});
</script>

<style scoped>
.code-block {
  margin-top: 6px;
  border-radius: 8px;
  overflow: hidden;
  min-height: 40px;
}
</style>
