"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import DropdownProvider from "@/providers/DropdownProvider";
import { useDropdownContext } from "@/providers/DropdownProvider";
import mergeClass from "@/util/mergeClass";
import emptyFunc from "@/util/emptyFunc";

const DropdownItem = function({
  children,
  id,
  href,
  className: importedClassName,
  ...rest
}) {
  const {
    _menuOpen: group_menuOpen,
    _setMenuOpen: group_setMenuOpen,
    _itemSelected: group_itemSelected,
    _setItemSelected: group_setItemSelected,
    itemData: group_itemData,
    mode: group_mode,
    className: group_className,
  } = useDropdownContext();

  const itemData = group_itemData[id];

  if (!itemData) {
    throw Error("Item data does not exist for id \"" + id + "\"");
  } else if (href && group_mode !== "weblink") {
    throw Error("href can only be used in DropdownItem components if Dropdown mode is set to \"weblink\"");
  }

  const isSelected = group_itemSelected.id === id;
  const className = mergeClass(group_className.list.buttons, importedClassName);

  const onItemSelected = () => {
    if (!isSelected) {
      group_setItemSelected(itemData);
      group_setMenuOpen(false);
    }
  }

  const renderButtonItem = () => {
    switch (group_mode) {
      case "select":
        return (
          <Button 
          onClick={onItemSelected}
          state={{ _isSelected: isSelected }}
          className={className}
          {...rest}>
            {children}
          </Button>
        );

      case "weblink":
        return (
          <Button 
          className={className}
          href={href}
          {...rest}>
            {children}
          </Button>
        );
    }
  }

  return renderButtonItem();
}

const Dropdown = function({
  mode="select",
  itemData={},
  children,
  hideMenuOnBlur=true,
  toggleOnHover=false,
  toggleOnClick=true,
  placeholder="Select an Option",
  defaultValue,
  defaultSelect,
  rightIconSelected,
  leftIconSelected,
  rightIconUnselected,
  leftIconUnselected,
  className: importedClassName={}
}) {
  // mutate itemData object to include id within metadata object
  for (let key in itemData) itemData[key].id = key;

  // initialize state hooks
  const [_itemSelected, _setItemSelected] = useState(
    itemData[defaultSelect] 
      || { id: "default", value: defaultValue, text: placeholder }
  );
  const [_menuOpen, _setMenuOpen] = useState(false);

  // all component styles
  let className = {
    self: "dropdown relative w-fit",

    list: {
      self: "absolute hidden flex-col w-full bg-button-primary list rounded-b overflow-hidden max-h-28 z-[9999]",

      buttons: {
        self: "w-full rounded-none relative bg-transparent justify-center", 
        __selected: {
          self: "bg-button-hover-primary"
        }
      },
    },

    menuButton: {},

    __selected: {
      list: {
        self: "flex"
      }
    }
  }

  className = mergeClass(
    className,
    importedClassName,
    { _isSelected: _menuOpen }
  );

  const onMenuClick = () => {
    if (toggleOnClick) {
      _setMenuOpen(!_menuOpen);
    }
  }

  const showDropdown = () => _setMenuOpen(true);
  const hideDropdown = () => _setMenuOpen(false);

  useEffect(() => {
    console.log("dropdown: ", _itemSelected);
  });

  return (
    <DropdownProvider
    value={{
      _itemSelected,
      _setItemSelected,
      _menuOpen,
      _setMenuOpen,
      className,
      itemData,
      mode,
    }}>
      <div className={className.self} onMouseLeave={toggleOnHover ? hideDropdown : emptyFunc}>
        <Button 
        onMouseEnter={toggleOnHover ? showDropdown : emptyFunc}
        onBlur={hideMenuOnBlur ? hideDropdown : emptyFunc}
        rightIcon={_menuOpen ? rightIconSelected : rightIconUnselected}
        leftIcon={_menuOpen ? leftIconSelected : leftIconUnselected}
        className={className.menuButton}
        onClick={onMenuClick} 
        state={{ _isSelected: _menuOpen }}>
          {_itemSelected.text}
        </Button>
        <div className={className.list.self}>
          {children}
        </div>
      </div>
    </DropdownProvider>
  );
}

Dropdown.Item = DropdownItem;

export default Dropdown;