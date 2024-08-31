import React, { useEffect, useState } from "react";
import classes from "./field.module.scss";
import clsx from "clsx";
import SvgSelector from "../SvgSelector";

const FieldOfOpponent = ({
  selectedCell,
  handleSelectCell,
  shots,
  destroyedShips,
}) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [hoveredCell, setHoveredCell] = useState([]);

  const handleMouseEnter = (row, col) => {
    setHoveredCell({ row, col });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };
  const isHit = (row, col) => {
    return shots.some(
      (shot) => shot.cell.row === row && shot.cell.col === col && shot.hit
    );
  };
  const isMiss = (row, col) => {
    return shots.some(
      (shot) => shot.cell.row === row && shot.cell.col === col && !shot.hit
    );
  };
  const isDestroyedShipCell = (row, col) => {
    return destroyedShips.some((ship) =>
      ship.cells.some((cell) => cell.row === row && cell.col === col)
    );
  };
  const handleClick = (row, col) => {
    if (isHit(row, col) || isMiss(row, col)) {
      console.warn(
        `Клетка (${row}, ${col}) уже была выбрана. Попробуйте другую.`
      );
      return;
    }

    handleSelectCell(row, col);
  };

  return (
    <div className={classes["grid-container"]}>
      {cols.map((col) => (
        <div key={col} className={classes.header}>
          {String(col).padStart(2, "00")}
        </div>
      ))}
      <div className={clsx(classes.header, classes.empty)}></div>
      {rows.map((row) => (
        <React.Fragment key={row}>
          {cols.map((col) => (
            <div
              key={row + col}
              className={clsx(
                classes.cell,
                classes.pink,
                hoveredCell?.row === row &&
                  hoveredCell?.col === col &&
                  classes.hoveredPink,
                selectedCell?.row === row &&
                  selectedCell?.col === col &&
                  classes.selected,
                isHit(row, col) && classes.hit,
                isMiss(row, col) && classes.miss,
                isDestroyedShipCell(row, col) && classes.destroyed
              )}
              onMouseEnter={() => handleMouseEnter(row, col)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(row, col)}
            >
              {isHit(row, col) ? <SvgSelector id="hit" /> : isMiss(row, col)}
            </div>
          ))}
          <div className={classes.header}>{row}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default FieldOfOpponent;
