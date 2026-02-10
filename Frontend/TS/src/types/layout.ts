export type LayoutThemeType = "light" | "dark"
export type LayoutModeType = "fluid" | "detached"
export type LayoutOrientationType = "vertical" | "horizontal" | "detached" | "two-column"
export type LayoutWidthType = "fluid" | "boxed"

export type TopBarThemeType = "light" | "dark" | "brand"

export type MenuThemeType = "light" | "dark" | "brand" | "gradient"
export type MenuSizeType = "default" | "condensed" | "compact" | "full" | "fullscreen"
export type MenuPositionType = "fixed" | "scrollable"

export type IconMenuThemeType = MenuThemeType

export type OffcanvasControlType = {
    open: boolean
    toggle: () => void
}

export type MenuType = {
    theme: MenuThemeType
    size: MenuSizeType
    position: MenuPositionType
}

export type TopBarType = {
    theme: TopBarThemeType
}

export type TwoColumnType = {
    iconMenuTheme: IconMenuThemeType
}


export type LayoutState = {
    theme: LayoutThemeType
    mode: LayoutModeType
    orientation: LayoutOrientationType
    width: LayoutWidthType
    topBar: TopBarType
    menu: MenuType
    twoColumn: TwoColumnType
    showTwoToneIcons: boolean
    showUserInfo: boolean
}

export type LayoutOffcanvasStatesType = {
    showThemeCustomizer: boolean
    showHorizontalMenu: boolean
    showBackdrop: boolean
}

export type LayoutType = LayoutState & {

    changeTheme: (theme: LayoutThemeType) => void
    changeLayoutOrientation: (orientation: LayoutOrientationType) => void
    changeLayoutMode: (mode: LayoutModeType) => void
    changeLayoutWidth: (width: LayoutWidthType) => void
    changeTopBarTheme: (theme: TopBarThemeType) => void
    changeMenuTheme: (theme: MenuType['theme']) => void
    changeMenuSize: (size: MenuType['size']) => void
    changeMenuPosition: (position: MenuType['position']) => void
    changeIconMenuTheme: (theme: IconMenuThemeType) => void

    toggleTwoToneIcons: () => void
    toggleUserInfo: () => void

    themeCustomizer: OffcanvasControlType
    horizontalMenu: OffcanvasControlType
    toggleBackdrop: () => void
    resetSettings: () => void
}