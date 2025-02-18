import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import Colors from '../../Helper/Colors';
import HistoryBack from "../../assets/icons/historyBack.svg";
import BackgroundMindMap from "../../assets/backgroundMindMap.png";
import { getChatHistoryByMessageId } from '../../redux-store/Chat/ChatAction';

const jsonToMarkdown = (node, depth = 0) => {
  const indent = '  '.repeat(depth);
  let markdown = `${indent}- ${node.content}\n`;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      markdown += jsonToMarkdown(child, depth + 1);
    }
  }
  return markdown;
};

const MindmapPage = () => {
  const markmapContainerRef = useRef(null);
  const navigate = useNavigate();
  const { id: messageId } = useParams();

  const [mindmapData, setMindmapData] = useState(null);
  const colorCache = new Map();

  useEffect(() => {
    const fetchMindmapData = async () => {
      try {
        if (!messageId) {
          return;
        }
        const res = await getChatHistoryByMessageId(messageId);
        if (res.status === 200 && res.data) {
          const message = res.data;
          if (message && message.message) {
            try {
              const parsedMessage = JSON.parse(message.message);
              if (parsedMessage.type === "Mindmap") {
                setMindmapData(parsedMessage.data);
              } else {
                console.error("Invalid mindmap format.");
              }
            } catch (error) {
              console.error("Error parsing JSON from message:", error);
            }
          } else {
            console.error("Message ID not found in chat history.");
          }
        } else {
          console.error("Invalid API response structure.");
        }
      } catch (error) {
        console.error("Error fetching mindmap data:", error);
      }
    };

    fetchMindmapData();
  }, [ messageId]);

  useEffect(() => {
    if (!mindmapData) return;

    const markdown = jsonToMarkdown(mindmapData);
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    const svgElement = markmapContainerRef.current;
    const markmapInstance = Markmap.create(svgElement, {}, root);
    applyCustomStyles();
    observeMarkmapUpdates(svgElement);

  }, [mindmapData]);

  const applyCustomStyles = () => {
    const svg = markmapContainerRef.current;
    if (!svg) return;
    const textNodes = svg.querySelectorAll('foreignObject');

    textNodes.forEach(textNode => {
        textNode.style.cursor = 'pointer';

        textNode.addEventListener('click', (event) => {
            event.stopPropagation();

            const parentGroup = textNode.closest('g.markmap-node');
            if (!parentGroup) return;

            const circle = parentGroup.querySelector('circle');
            if (circle) {
                circle.dispatchEvent(new Event('click', { bubbles: true }));
            }
            setTimeout(() => applyCustomStyles(), 300);
        });
    });
    const links = svg.querySelectorAll('path');
    links.forEach(link => {
        link.style.stroke = '#808080';
        link.style.strokeWidth = '4px';
    });
    const nodes = svg.querySelectorAll('g[data-depth] foreignObject > div');
    let maxDepth = 0;

    nodes.forEach(node => {
        const parentGroup = node.closest('g[data-depth]');
        if (!parentGroup) return;

        const depth = parseInt(parentGroup.getAttribute('data-depth'), 10);
        if (depth > maxDepth) maxDepth = depth;
    });

    nodes.forEach(node => {
        const parentGroup = node.closest('g[data-depth]');
        if (!parentGroup) return;
        const depth = parseInt(parentGroup.getAttribute('data-depth'), 10);
        const isLeafNode = depth === maxDepth;
        const nodeKey = parentGroup.getAttribute('data-path') || `depth-${depth}`;

        if (!colorCache.has(nodeKey)) {
          const r = Math.floor(Math.random() * 100);
          const g = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100);
          colorCache.set(nodeKey, `rgb(${r}, ${g}, ${b})`);
        }

        const backgroundColor =  isLeafNode ? "transparent" : colorCache.get(nodeKey);
        const textColor = isLeafNode ? "#000" : "#fff";
        const baseFontSize = 18;
        const fontSize = Math.max(12, baseFontSize - depth * 2);
        const baseFontWeight = 700;
        const fontWeight = isLeafNode ? 400 : baseFontWeight - depth * 100;

        node.style.backgroundColor = backgroundColor;
        node.style.color = textColor;
        node.style.margin = "8px 0px 0px -8px";
        node.style.padding = "2px 10px";
        node.style.borderRadius = '5px';
        node.style.width = 'max-content';
        node.style.fontWeight = fontWeight;
        node.style.fontSize = `${fontSize}px`;
    });
  };

  const observeMarkmapUpdates = (svg) => {
    if (!svg) return;

    const observer = new MutationObserver(() => {
        applyCustomStyles();
    });

    observer.observe(svg, {
        childList: true,
        subtree: true,
    });
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      minHeight: 'calc(100vh - 48px)',
      padding: 3,
      backgroundImage: `url(${BackgroundMindMap})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }}>
      {/* Back Button */}
      <Box sx={{ position: 'fixed', left: 20, top: 20, zIndex: 9999 }}>
        <img
          src={HistoryBack}
          style={{ height: '40px', cursor: 'pointer' }}
          alt="Back"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          }}
        />
      </Box>

      {/* Title */}
      <Typography sx={{
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
        color: Colors.FlashCardAnswerColor,
        background: '#4AD4E3',
        padding: '15px 40px',
        borderRadius: '20px',
      }}>
        {mindmapData?.title || "Mindmap"}
      </Typography>

      {/* Mindmap SVG */}
      <svg ref={markmapContainerRef} style={{ width: '100%', height: 'calc(100vh - 200px)' }} />
    </Box>
  );
};

export default MindmapPage;
