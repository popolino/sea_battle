import React, { useEffect } from "react";
import classes from "./field.module.scss";
import clsx from "clsx";
import SvgSelector from "../SvgSelector";

const Field = ({
  hoveredCell,
  onCellMouseEnter,
  onCellMouseLeave,
  handleWheelClick,
  placedShips,
  onPlaceShip,
  onReplaceShip,
  enemyShots,
  progressGame,
}) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const handleClick = (row, col) => {
    if (!progressGame) {
      const shipCell = placedShips.find(
        (cell) => cell.row === row && cell.col === col
      );
      if (placedShips.some((cell) => cell.row === row && cell.col === col)) {
        onReplaceShip(shipCell.shipId, row, col);
      } else onPlaceShip();
    }
  };
  const isHit = (row, col) => {
    return enemyShots.some(
      (shot) => shot.row === row && shot.col === col && shot.hit
    );
  };
  const isMiss = (row, col) => {
    return enemyShots.some(
      (shot) => shot.row === row && shot.col === col && !shot.hit
    );
  };

  return (
    <div className={classes["grid-container"]}>
      <div className={clsx(classes.header, classes.empty)}></div>
      {cols.map((col) => (
        <div key={col} className={classes.header}>
          {String(col).padStart(2, "0")}
        </div>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row}>
          <div className={classes.header}>{row}</div>
          {cols.map((col) => (
            <div
              key={row + col}
              className={clsx(classes.cell, {
                [classes.hovered]:
                  hoveredCell &&
                  hoveredCell.some(
                    (cell) =>
                      cell.row === row && cell.col === col && !cell.invalid
                  ),
                [classes.ship]:
                  placedShips &&
                  placedShips.some(
                    (cell) => cell.row === row && cell.col === col
                  ),
                [classes.invalid]:
                  hoveredCell &&
                  hoveredCell.some(
                    (cell) =>
                      cell.row === row && cell.col === col && cell.invalid
                  ),
                [classes["hit-enemy"]]:
                  enemyShots && enemyShots.length > 0 && isHit(row, col),
                [classes["miss-opponent"]]:
                  enemyShots && enemyShots.length > 0 && isMiss(row, col),
              })}
              onMouseEnter={() => onCellMouseEnter(row, col)}
              onMouseLeave={onCellMouseLeave}
              onMouseDown={handleWheelClick}
              onClick={() => handleClick(row, col)}
            >
              {enemyShots && enemyShots.length > 0 && isHit(row, col) ? (
                <SvgSelector id="hit" />
              ) : (
                isMiss(row, col)
              )}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Field;
