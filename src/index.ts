figma.showUI(__html__, { width: 250, height: 450 });

figma.ui.onmessage = msg => {
  if(msg.type === 'init') {
    if(figma.currentPage.selection.length === 0) {
      figma.ui.postMessage({ type: 'artboardSelect', message: false });
    }else {
      const artboard = figma.currentPage.selection[0] as FrameNode;
      if(artboard.type === 'FRAME') {
        figma.ui.postMessage({ type: 'artboardSelect', message: true });
      }
    }
  }

  if(msg.type === 'submit') {
    let { artboardWidth, baselinePixel, columnCount, columnGap, containerScreenPercentage, acceptArtboardWidthChange } = msg;

    artboardWidth = parseInt(artboardWidth, 10);
    baselinePixel = parseInt(baselinePixel, 10);
    columnCount = parseInt(columnCount, 10);
    columnGap = parseInt(columnGap, 10);
    containerScreenPercentage = parseInt(containerScreenPercentage, 10);

    const artboard = figma.currentPage.selection[0] as FrameNode;

    artboardWidth = Math.ceil(artboardWidth / baselinePixel) * baselinePixel;
    columnGap = Math.round(columnGap / baselinePixel) * baselinePixel;
    columnCount = Math.round(columnCount / (baselinePixel / 10)) * (baselinePixel / 10);


    let containerMaxWidth = (artboardWidth) * (containerScreenPercentage / 100);
    let margin = ((artboardWidth - containerMaxWidth) / 2);
    margin = Math.round(margin / baselinePixel) * baselinePixel;
    containerMaxWidth = Math.ceil(containerMaxWidth / baselinePixel) * baselinePixel;

    let columnWidth = ((containerMaxWidth - (columnGap * (columnCount - 1))) / columnCount);
    columnWidth = Math.round(columnWidth / baselinePixel) * baselinePixel;

    artboardWidth = columnWidth * columnCount + (columnGap * (columnCount - 1))+ (margin * 2);



    if(!acceptArtboardWidthChange && artboardWidth !== artboard.width) {
      figma.ui.postMessage({ type: 'acceptArtboardWidthChange', message: { current: artboard.width, newSize: artboardWidth }});
      return;
    }

    if(artboard.layoutGrids.length > 0) {
      artboard.layoutGrids = [];
    }

    artboard.resize(artboardWidth, artboard.height);

    const layoutGrids = [
      {
        alignment: "CENTER",
        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
        count: columnCount,
        gutterSize: columnGap,
        pattern: "COLUMNS",
        sectionSize: columnWidth,
        visible: true
      },
      {
        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
        pattern: "GRID",
        sectionSize: baselinePixel,
        visible: true,
      }
    ];

    artboard.layoutGrids = layoutGrids as any;

    // view the artboard
    figma.viewport.scrollAndZoomIntoView([artboard]);
  }

  if(msg.type === 'cancel') {
    figma.closePlugin();
  }
}

// if a user deselect the artboard, send a message to the UI
figma.on('selectionchange', () => {
  if(figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({ type: 'artboardSelect', message: false });
  }else {
    const artboard = figma.currentPage.selection[0] as FrameNode;
    if(artboard.type === 'FRAME') {
      figma.ui.postMessage({ type: 'artboardSelect', message: true });
    }
  }
});