interface TextFragment {
  text: string;
  format?: TextFormat;
}

interface TextFormat {
  uppercase?: boolean;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

interface Alignment {
  horizontal?: "left" | "center" | "normal" | "right" | null;
  vertical?: "top" | "middle" | "bottom" | null;
}

interface BorderStyle {
  style?: "solid" | "dotted" | "dashed" | "none";
  thickness?: number;
  color?: string;
}

interface Borders {
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
}

interface Background {
  color?: string;
}

interface CellStyles {
  alignment?: Alignment;
  border?: Borders;
  background?: Background;
}

interface Cell {
  value: TextFragment[];
  range: string;
  styles?: CellStyles;
  modifiable?: boolean;
}

interface ConfigTableSection {
  name: string;
  title: Cell;
  subtitle: Cell[];
  content: Cell[];
}

type ConfigTable = ConfigTableSection[];