import {$generateHtmlFromNodes, $generateNodesFromDOM} from "@lexical/html";
import {useEffect} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";

import {
    $getRoot,
    $insertNodes,
    EditorState,

} from "lexical";

// Custom plugins for HTML transformation
function CustomTransformHTMLToLexical({description}: {
    description: string;
}): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!description) return;

        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(description, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            $insertNodes(nodes);
        });
    }, [description, editor]);


    return null;
}

function CustomTransformLexicalToHTML({
                                          setEditorState,
                                      }: {
    setEditorState: (state: string) => void;
}): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(
            ({editorState}: { editorState: EditorState }) => {
                editorState.read(() => {
                    let htmlString = $generateHtmlFromNodes(editor, null);
                    htmlString = htmlString.replace(/^(<p[^>]*><br><\/p>)+/, "");
                    htmlString = htmlString.replace(/(<p[^>]*><br><\/p>)+$/, "");
                    setEditorState(htmlString);
                });
            }
        );
    }, [editor, setEditorState]);

    return null;
}


export {CustomTransformHTMLToLexical, CustomTransformLexicalToHTML};