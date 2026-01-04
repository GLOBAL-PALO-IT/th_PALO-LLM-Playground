import { MenuItemsListParamsType } from "@/app/api/runChatMenu/tools";
import Link from 'next/link';
import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import {
  JsonView,
  allExpanded,
  darkStyles,
} from 'react-json-view-lite';
import { generatePath, isPathExistInMenuItemsFromId } from "../NavBar/mockMenu";
export const MenuBox = ({ selectedMenu }: MenuItemsListParamsType) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    title,
    description,
    categoryId,
    itemId,
  } = selectedMenu
  const isPathExists = isPathExistInMenuItemsFromId(categoryId, itemId)
  return (
    // box with gray border
    <div>
      <div className="mt-2 p-1 flex flex-row items-center">
        <div className="p-1 border-2 border-blue-500 bg-white text-blue-500 rounded">
          <Link
            href={isPathExists ? isPathExists : generatePath(categoryId, itemId)}
            className={`px-3 py-2`}
            aria-current="page"
          >
            {title}-{description}
          </Link>
        </div>
        <div className="pl-2 items-center flex">{showDetails ? (
          <button onClick={() => setShowDetails(false)}>
            <FaEyeSlash className="m-1" />
          </button>
        ) : (
          <button onClick={() => setShowDetails(true)}>
            <FaEye className="m-1" />
          </button>
        )}</div>

      </div>
      {showDetails && (
        <JsonView
          data={selectedMenu}
          shouldExpandNode={allExpanded}
          style={darkStyles}
        />
      )}
    </div>
  )
};