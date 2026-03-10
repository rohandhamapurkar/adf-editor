import React, { useState, useRef, useCallback, useEffect } from 'react';
import { IntlProvider } from 'react-intl-next';
import TextArea from '@atlaskit/textarea';
import { ComposableEditor } from '@atlaskit/editor-core/composable-editor';
import { useUniversalPreset } from '@atlaskit/editor-core/preset-universal';
import { usePreset } from '@atlaskit/editor-core/use-preset';
import { EditorContext, WithEditorActions, ToolbarHelp } from '@atlaskit/editor-core';
import type { EditorActions, EditorProps } from '@atlaskit/editor-core';
import type { ExtractInjectionAPI } from '@atlaskit/editor-common/types';
import type { HelpDialogPlugin } from '@atlaskit/editor-plugins/help-dialog';
import { mentionResourceProvider } from '../utils/SimpleMentionResource';
import ResizableSplit from './ResizableSplit';

const EDITOR_STATE_DB = 'adf-editor-state';
const EDITOR_STATE_STORE = 'editorState';
const EDITOR_STATE_KEY = 'latest-adf';

const openEditorStateDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(EDITOR_STATE_DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EDITOR_STATE_STORE)) {
        db.createObjectStore(EDITOR_STATE_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveEditorState = async (adfJson: string): Promise<void> => {
  const db = await openEditorStateDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EDITOR_STATE_STORE, 'readwrite');
    const store = tx.objectStore(EDITOR_STATE_STORE);
    store.put(adfJson, EDITOR_STATE_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

  db.close();
};

const loadEditorState = async (): Promise<string | null> => {
  const db = await openEditorStateDb();

  const value = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(EDITOR_STATE_STORE, 'readonly');
    const store = tx.objectStore(EDITOR_STATE_STORE);
    const request = store.get(EDITOR_STATE_KEY);

    request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return value;
};


const providers = {
  mentionProvider: Promise.resolve(mentionResourceProvider),
};

interface ComposableEditorWrapperProps extends EditorProps {
  onEditorApiReady?: (api: any) => void;
}

const ComposableEditorWrapper = ({ onEditorApiReady, ...props }: ComposableEditorWrapperProps) => {
  const initialPluginConfiguration = {
    tasksAndDecisionsPlugin: { allowBlockTaskItem: true },
  };
  const universalPreset = useUniversalPreset({ props, initialPluginConfiguration });
  const { preset, editorApi } = usePreset(() => universalPreset, [universalPreset]);

  useEffect(() => {
    if (editorApi && onEditorApiReady) {
      onEditorApiReady(editorApi);
    }
  }, [editorApi, onEditorApiReady]);

  return (
    <ComposableEditor
      preset={preset}
      {...props}
      primaryToolbarComponents={
        <ToolbarHelp
          key={1}
          titlePosition="top"
          title="Help"
          editorApi={
            props.allowHelpDialog
              ? (editorApi as ExtractInjectionAPI<HelpDialogPlugin>)
              : undefined
          }
        />
      }
    />
  );
};

const AdfViewer: React.FC = () => {
  const [isValidAdf, setIsValidAdf] = useState(true);
  const editorActionsRef = useRef<EditorActions | null>(null);
  const editorApiRef = useRef<any>(null);
  const adfTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingRestoreRef = useRef<string | null>(null);

  const replaceEditorDocument = useCallback((adfJson: string) => {
    if (editorApiRef.current?.core?.actions?.replaceDocument) {
      editorApiRef.current.core.actions.replaceDocument(adfJson);
      return true;
    }

    if (editorActionsRef.current) {
      editorActionsRef.current.replaceDocument(adfJson);
      return true;
    }

    return false;
  }, []);

  const handleEditorApiReady = useCallback((api: any) => {
    editorApiRef.current = api;

    if (pendingRestoreRef.current) {
      const restored = pendingRestoreRef.current;
      pendingRestoreRef.current = null;
      replaceEditorDocument(restored);
    }
  }, [replaceEditorDocument]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromIndexedDb = async () => {
      try {
        const savedAdf = await loadEditorState();
        if (!savedAdf || cancelled) {
          return;
        }

        if (adfTextAreaRef.current) {
          adfTextAreaRef.current.value = savedAdf;
        }

        const didReplace = replaceEditorDocument(savedAdf);
        if (!didReplace) {
          pendingRestoreRef.current = savedAdf;
        }
      } catch {
        // Ignore persistence errors to keep editor usable.
      }
    };

    hydrateFromIndexedDb();

    return () => {
      cancelled = true;
    };
  }, [replaceEditorDocument]);

  // Debounced editor→textarea sync to avoid race conditions on rapid typing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTextArea = useCallback(() => {
    if (!editorActionsRef.current) return;
    editorActionsRef.current.getValue().then((value) => {
      const serializedAdf = JSON.stringify(value, null, 2);
      if (adfTextAreaRef.current) {
        adfTextAreaRef.current.value = serializedAdf;
      }

      saveEditorState(serializedAdf).catch(() => {
        // Ignore persistence errors to avoid interrupting typing.
      });
    });
  }, []);

  const handleEditorChange = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(updateTextArea, 100);
  }, [updateTextArea]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAdfChange = useCallback(
    (e: { target: { value: string } }) => {
      const value = e.target.value;

      // Validate JSON first
      if (!value.trim()) {
        setIsValidAdf(true);
        return;
      }
      try {
        JSON.parse(value);
      } catch {
        setIsValidAdf(false);
        return;
      }

      // JSON is valid — push to editor
      setIsValidAdf(true);
      try {
        const didReplace = replaceEditorDocument(value);
        if (!didReplace) {
          pendingRestoreRef.current = value;
        }

        saveEditorState(value).catch(() => {
          // Ignore persistence errors to avoid blocking manual editing.
        });
      } catch {
        // replaceDocument may throw on schema-invalid ADF
        setIsValidAdf(false);
      }
    },
    [replaceEditorDocument]
  );

  return (
    <IntlProvider locale="en">
      <EditorContext>
        <ResizableSplit>
          {/* Left Panel — Editor */}
          <WithEditorActions
            render={(actions) => {
              editorActionsRef.current = actions;
              return (
                <ComposableEditorWrapper
                  appearance="full-page"
                  allowRule={true}
                  allowTextColor={true}
                  allowTables={{ allowControls: true }}
                  allowPanel={true}
                  allowHelpDialog={true}
                  placeholder="We support markdown! Try **bold**, `inline code`, or ``` for code blocks."
                  onChange={handleEditorChange}
                  onEditorApiReady={handleEditorApiReady}
                  {...providers}
                />
              );
            }}
          />
          {/* Right Panel — ADF JSON */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '0 8px',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ margin: '8px 0', flexShrink: 0 }}>ADF</h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <TextArea
                isMonospaced={true}
                minimumRows={20}
                placeholder='{"version": 1...'
                isInvalid={!isValidAdf}
                ref={(ref: any) => (adfTextAreaRef.current = ref)}
                onChange={handleAdfChange}
              />
            </div>
          </div>
        </ResizableSplit>
      </EditorContext>
    </IntlProvider>
  );
};

export default AdfViewer;
