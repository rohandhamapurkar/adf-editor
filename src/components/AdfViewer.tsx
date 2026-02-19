import React, { useState, useRef, useCallback } from 'react';
import { IntlProvider } from 'react-intl-next';
import TextArea from '@atlaskit/textarea';
import { ComposableEditor } from '@atlaskit/editor-core/composable-editor';
import { useUniversalPreset } from '@atlaskit/editor-core/preset-universal';
import { usePreset } from '@atlaskit/editor-core/use-preset';
import { EditorContext, WithEditorActions, ToolbarHelp } from '@atlaskit/editor-core';
import type { EditorProps } from '@atlaskit/editor-core';
import type { ExtractInjectionAPI } from '@atlaskit/editor-common/types';
import type { HelpDialogPlugin } from '@atlaskit/editor-plugins/help-dialog';
import { mentionResourceProvider } from '@atlaskit/util-data-test/mention-story-data';
import ResizableSplit from './ResizableSplit';

const providers = {
  mentionProvider: Promise.resolve(mentionResourceProvider),
};

const ComposableEditorWrapper = (props: EditorProps) => {
  const initialPluginConfiguration = {
    tasksAndDecisionsPlugin: { allowBlockTaskItem: true },
  };
  const universalPreset = useUniversalPreset({ props, initialPluginConfiguration });
  const { preset, editorApi } = usePreset(() => universalPreset, [universalPreset]);

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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleAdfChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Will be wired up in Milestone 6 for bidirectional sync
      const value = e.target.value;
      if (!value.trim()) {
        setIsValidAdf(true);
        return;
      }
      try {
        JSON.parse(value);
        setIsValidAdf(true);
      } catch {
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
            render={(actions) => (
              <ComposableEditorWrapper
                appearance="full-page"
                allowRule={true}
                allowTextColor={true}
                allowTables={{ allowControls: true }}
                allowPanel={true}
                allowHelpDialog={true}
                placeholder="We support markdown! Try **bold**, `inline code`, or ``` for code blocks."
                {...providers}
              />
            )}
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
                ref={(el: HTMLTextAreaElement | null) => {
                  textAreaRef.current = el;
                }}
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
