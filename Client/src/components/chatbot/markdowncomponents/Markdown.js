import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from 'rehype-raw';
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import Colors from "../../../Helper/Colors";
import { toast } from "react-toastify";
import CopyIconWhite from "../../../assets/icons/copyWhite.svg";


function Markdown({ content }) {
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success("Code copied to clipboard!");
        });
    };
    
  return (
    <ReactMarkdown 
        children={content} 
        remarkPlugins={[remarkGfm, remarkMath]} 
        rehypePlugins={[rehypeKatex, rehypeRaw]} 
        components={{
            h1: ({ children }) => <h1 style={{color: Colors.DarkBlueTextColor}}>{children}</h1>,
            h2: ({ children }) => <h2 style={{color: Colors.DarkBlueTextColor}}>{children}</h2>,
            h3: ({ children }) => <h3 style={{color: Colors.DarkBlueTextColor}}>{children}</h3>,
            h4: ({ children }) => <h4 style={{color: Colors.DarkBlueTextColor}}>{children}</h4>,
            h5: ({ children }) => <h5 style={{color: Colors.DarkBlueTextColor}}>{children}</h5>,
            h6: ({ children }) => <h6 style={{color: Colors.DarkBlueTextColor}}>{children}</h6>,
            strong: ({ children }) => <strong style={{color: Colors.DarkBlueTextColor}}>{children}</strong>,
            table: ({ children }) => (
                <div style={{ overflowX: "auto", whiteSpace: "nowrap", width: '43vw', position: 'relative' }}>
                    <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: `1px solid ${Colors.black}`,
                    }}
                    >
                    {children}
                    </table>
                </div>
                ),
                th: ({ children }) => (
                <th style={{
                    border: 'none',
                    padding: "8px",
                    background: Colors.DarkBlueTextColor,
                    color: Colors.white,
                    whiteSpace: "nowrap",
                }}>
                    {children}
                </th>
                ),
                td: ({ children }) => (
                <td style={{
                    borderBottom: `1px solid ${Colors.black}`,
                    padding: "8px",
                    whiteSpace: "nowrap",
                }}>
                    {children}
                </td>
                ),
            mark: ({ children }) => <mark style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>{children}</mark>,
            code({ node, inline, className, children, ...props }) {
                const isInlineCode = (parseInt(node.position.start.line) < parseInt(node.position.end.line)) ? false : true;
                console.log('node :: ',node);
                console.log('isInlineCode :: ',isInlineCode);
                console.log('className :: ',className);
                console.log('children :: ',children);
                // console.log('...props :: ',...props);
                
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
    
                return isInlineCode ? (
                <code
                    {...props}
                    style={{
                    background: Colors.inlineCodeBg,
                    padding: "1px 8px",
                    borderRadius: "6px",
                    color: Colors.white,
                    fontSize: '0.9rem'
                    }}
                >
                    {children}
                </code>
                ) : (
                <div
                    className="codeBlockMainWrap"
                    style={{
                    width: "100%",
                    margin: "auto",
                    borderRadius: "10px",
                    border: "1px solid grey",
                    background: '#2f2f2f',
                    padding: "40px 0 0 0",
                    position: "relative",
                    overflow: 'hidden'
                    }}
                >
                    <div
                    style={{
                        position: "absolute",
                        top: "5px",
                        right: "10px",
                        color: "#fff",
                        padding: "5px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: 300
                    }}
                    onClick={() => copyToClipboard(codeString)}
                    >
                    <img src={CopyIconWhite} style={{width: '18px', height: 'auto'}} /> Copy
                    </div>
                    <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match ? match[1] : "plaintext"}
                    {...props}
                    >
                    {codeString}
                    </SyntaxHighlighter>
                </div>
                );
            },    
        }}
    />
  );

}

export default Markdown;
