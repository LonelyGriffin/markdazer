import { AstBaseNode } from "./base";
import { AstContainer } from "./container";
import { AstDocument } from "./document";
import { AstHeader } from "./header";
import { AstLink } from "./link";
import { AstList } from "./list";
import { AstListItem } from "./listItem";
import { AstLine } from "./line";
import { AstTable } from "./table";
import { AstTableCell } from "./tableCell";
import { AstTableRow } from "./tableRow";
import { AstText } from "./text";

export enum AstNodeType {
  Base = "Base",
  Container = "Container",
  Document = "Document",
  Line = "Line",
  Text = "Text",
  Header = "Header",
  List = "List",
  ListItem = "ListItem",
  Table = "Table",
  TableRow = "TableRow",
  TableCell = "TableCell",
  Link = "Link",
}

export type AstNode =
  | AstBaseNode
  | AstContainer
  | AstDocument
  | AstLine
  | AstText
  | AstHeader
  | AstList
  | AstListItem
  | AstTable
  | AstTableRow
  | AstTableCell
  | AstLink;
