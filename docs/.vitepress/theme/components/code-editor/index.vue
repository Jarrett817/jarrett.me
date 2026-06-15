<template>
  <div ref="target" class="monaco-editor-wrap"></div>
</template>
<script setup lang="ts">
import { type editor as Editor } from 'monaco-editor';
import { nextTick, onUnmounted, ref, watch } from 'vue';
//@ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
//@ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
//@ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
//@ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
//@ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

interface Props {
  value: string | null;
}

const target = ref<HTMLCanvasElement | null>(null);
let editor: null | Editor.IStandaloneCodeEditor = null;
const props = withDefaults(defineProps<Props>(), {
  value: null
});
async function updateEditorHeightAuto() {
  if (!editor) return;
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    }
  };
  const monaco = await import('monaco-editor');

  const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
  const lineCount = editor.getModel()?.getLineCount() || 1;
  const height = editor.getTopForLineNumber(lineCount + 1) + lineHeight;

  if (target.value) {
    target.value.style.height = `${height + 12}px`;
  }
  editor.layout();
}
watch(
  () => props.value,
  value => {
    nextTick(async () => {
      if (target?.value && value) {
        const monaco = await import('monaco-editor');

        editor = monaco.editor.create(target?.value, {
          value,
          language: 'typescript',
          theme: 'vs-dark',
          formatOnPaste: true
        });
        nextTick(() => {
          updateEditorHeightAuto();
          editor && editor.getAction('editor.action.formatDocument')?.run();
        });
      }
    });
  },
  {
    immediate: true
  }
);

onUnmounted(() => {
  editor?.dispose();
});
</script>

<style lang="scss" scoped></style>
