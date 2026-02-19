import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl-next';
import TextArea from '@atlaskit/textarea';
import { ComposableEditor } from '@atlaskit/editor-core/composable-editor';
import { useUniversalPreset } from '@atlaskit/editor-core/preset-universal';
import { usePreset } from '@atlaskit/editor-core/use-preset';
import { EditorContext, WithEditorActions, ToolbarHelp } from '@atlaskit/editor-core';
import type { EditorActions, EditorProps } from '@atlaskit/editor-core';
import type { ExtractInjectionAPI } from '@atlaskit/editor-common/types';
import type { HelpDialogPlugin } from '@atlaskit/editor-plugins/help-dialog';
import { mentionResourceProvider } from '@atlaskit/util-data-test/mention-story-data';
import ResizableSplit from './ResizableSplit';

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

  const handleEditorApiReady = useCallback((api: any) => {
    editorApiRef.current = api;
  }, []);

  // Debounced editor→textarea sync to avoid race conditions on rapid typing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateTextArea = useCallback(() => {
    if (!editorActionsRef.current) return;
    editorActionsRef.current.getValue().then((value) => {
      if (adfTextAreaRef.current) {
        adfTextAreaRef.current.value = JSON.stringify(value, null, 2);
      }
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
        if (editorApiRef.current?.core?.actions?.replaceDocument) {
          editorApiRef.current.core.actions.replaceDocument(value);
        } else if (editorActionsRef.current) {
          editorActionsRef.current.replaceDocument(value);
        }
      } catch {
        // replaceDocument may throw on schema-invalid ADF
        setIsValidAdf(false);
      }
    },
    []
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
