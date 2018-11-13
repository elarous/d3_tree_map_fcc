(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.squarify = {})));
}(this, (function (exports) { 'use strict';

  function index (data, container) {
      const x0 = container.x0;
      const y0 = container.y0;
      const x1 = container.x1;
      const y1 = container.y1;
      const input = {
          x0, y0, x1, y1,
          children: data,
      };
      return recurse(input);
  }
  const calculateMaxAspectRatio = (row, length) => {
      const rowLength = row.length;
      if (rowLength === 0) {
          throw new Error('Inpupt ' + row + ' is an empty array');
      }
      else {
          let minArea = Infinity;
          let maxArea = -Infinity;
          let sumArea = 0;
          for (let i = 0; i < rowLength; i += 1) {
              const area = row[i].normalizedValue;
              if (area < minArea) {
                  minArea = area;
              }
              if (area > maxArea) {
                  maxArea = area;
              }
              sumArea += area;
          }
          const result = Math.max((length ** 2) * maxArea / (sumArea ** 2), (sumArea ** 2) / ((length ** 2) * minArea));
          return result;
      }
  };
  const doesAddingToRowImproveAspectRatio = (currentRow, nextDatum, length) => {
      if (currentRow.length === 0) {
          return true;
      }
      else {
          const newRow = currentRow.concat(nextDatum);
          const currentMaxAspectRatio = calculateMaxAspectRatio(currentRow, length);
          const newMaxAspectRatio = calculateMaxAspectRatio(newRow, length);
          return (currentMaxAspectRatio >= newMaxAspectRatio);
      }
  };
  const normalizeData = (data, area) => {
      const dataLength = data.length;
      let dataSum = 0;
      for (let i = 0; i < dataLength; i += 1) {
          dataSum += data[i].value;
      }
      const multiplier = area / dataSum;
      const result = [];
      let elementResult, datum;
      for (let j = 0; j < dataLength; j += 1) {
          datum = data[j];
          elementResult = Object.assign({}, datum, {
              normalizedValue: datum.value * multiplier,
          });
          result.push(elementResult);
      }
      return result;
  };
  const containerToRect = (container) => {
      const xOffset = container.xOffset;
      const yOffset = container.yOffset;
      const width = container.width;
      const height = container.height;
      return {
          x0: xOffset,
          y0: yOffset,
          x1: xOffset + width,
          y1: yOffset + height,
      };
  };
  const rectToContainer = (rect) => {
      const x0 = rect.x0;
      const y0 = rect.y0;
      const x1 = rect.x1;
      const y1 = rect.y1;
      return {
          xOffset: x0,
          yOffset: y0,
          width: x1 - x0,
          height: y1 - y0,
      };
  };
  const getShortestEdge = (input) => {
      const container = rectToContainer(input);
      const width = container.width;
      const height = container.height;
      const result = Math.min(width, height);
      return result;
  };
  const getCoordinates = (row, rect) => {
      const container = rectToContainer(rect);
      const width = container.width;
      const height = container.height;
      const xOffset = container.xOffset;
      const yOffset = container.yOffset;
      const rowLength = row.length;
      let valueSum = 0;
      for (let i = 0; i < rowLength; i += 1) {
          valueSum += row[i].normalizedValue;
      }
      const areaWidth = valueSum / height;
      const areaHeight = valueSum / width;
      let subXOffset = xOffset;
      let subYOffset = yOffset;
      const coordinates = [];
      if (width >= height) {
          for (let i = 0; i < rowLength; i += 1) {
              const num = row[i];
              const y1 = subYOffset + num.normalizedValue / areaWidth;
              const rectangle = {
                  x0: subXOffset,
                  y0: subYOffset,
                  x1: subXOffset + areaWidth,
                  y1,
              };
              const nextCoordinate = Object.assign({}, num, rectangle);
              subYOffset = y1;
              coordinates.push(nextCoordinate);
          }
          return coordinates;
      }
      else {
          for (let i = 0; i < rowLength; i += 1) {
              const num = row[i];
              const x1 = subXOffset + num.normalizedValue / areaHeight;
              const rectangle = {
                  x0: subXOffset,
                  y0: subYOffset,
                  x1,
                  y1: subYOffset + areaHeight,
              };
              const nextCoordinate = Object.assign({}, num, rectangle);
              subXOffset = x1;
              coordinates.push(nextCoordinate);
          }
          return coordinates;
      }
  };
  const cutArea = (rect, area) => {
      const { width, height, xOffset, yOffset } = rectToContainer(rect);
      if (width >= height) {
          const areaWidth = area / height;
          const newWidth = width - areaWidth;
          const container = {
              xOffset: xOffset + areaWidth,
              yOffset,
              width: newWidth,
              height,
          };
          return containerToRect(container);
      }
      else {
          const areaHeight = area / width;
          const newHeight = height - areaHeight;
          const container = {
              xOffset,
              yOffset: yOffset + areaHeight,
              width,
              height: newHeight,
          };
          return containerToRect(container);
      }
  };
  const squarify = (inputData, inputCurrentRow, inputRect, inputStack) => {
      let data = inputData, currentRow = inputCurrentRow, rect = inputRect, stack = inputStack;
      while (true) {
          const dataLength = data.length;
          if (dataLength === 0) {
              const newCoordinates = getCoordinates(currentRow, rect);
              const newStack = stack.concat(newCoordinates);
              return newStack;
          }
          const width = getShortestEdge(rect);
          const nextDatum = data[0];
          const restData = data.slice(1, dataLength);
          if (doesAddingToRowImproveAspectRatio(currentRow, nextDatum, width)) {
              const newRow = currentRow.concat(nextDatum);
              data = restData;
              currentRow = newRow;
              rect = rect;
              stack = stack;
          }
          else {
              const currentRowLength = currentRow.length;
              let valueSum = 0;
              for (let i = 0; i < currentRowLength; i += 1) {
                  valueSum += currentRow[i].normalizedValue;
              }
              const newContainer = cutArea(rect, valueSum);
              const newCoordinates = getCoordinates(currentRow, rect);
              const newStack = stack.concat(newCoordinates);
              data = data;
              currentRow = [];
              rect = newContainer;
              stack = newStack;
          }
      }
  };
  const flatten = (listOfLists) => {
      const result = [];
      const listOfListsLength = listOfLists.length;
      for (let i = 0; i < listOfListsLength; i += 1) {
          const innerList = listOfLists[i];
          const innerListLength = innerList.length;
          for (let j = 0; j < innerListLength; j += 1) {
              result.push(innerList[j]);
          }
      }
      return result;
  };
  const getArea = (rect) => (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
  const recurse = (datum) => {
      if (datum.children === undefined) {
          const result = [datum];
          return result;
      }
      else {
          const normalizedChildren = normalizeData(datum.children, getArea(datum));
          const squarified = squarify(normalizedChildren, [], datum, []);
          const squarifiedLength = squarified.length;
          const contained = [];
          for (let i = 0; i < squarifiedLength; i += 1) {
              contained.push(recurse(squarified[i]));
          }
          const flattened = flatten(contained);
          return flattened;
      }
  };

  exports.default = index;
  exports.calculateMaxAspectRatio = calculateMaxAspectRatio;
  exports.doesAddingToRowImproveAspectRatio = doesAddingToRowImproveAspectRatio;
  exports.normalizeData = normalizeData;
  exports.getCoordinates = getCoordinates;
  exports.cutArea = cutArea;
  exports.squarify = squarify;
  exports.recurse = recurse;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
