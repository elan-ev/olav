import React from "react";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { graphql, useFragment } from "react-relay";
import type { Interpolation, Theme } from "@emotion/react";

import { Link } from "../router";
import type { NavigationData$key } from "../query-types/NavigationData.graphql";


/**
 * Source of navigation data: either it's stored directly or will be retrieved
 * via query.
 */
export type NavSource = {
    kind: "static";
    data: Navigation;
} | {
    kind: "query";
    fragRef: NavigationData$key;
};

export const navFromQuery = (fragRef: NavigationData$key): NavSource => (
    { kind: "query", fragRef }
);


/**
 * Defines everything about the navigation that's either shown as box
 * (desktop) or as burger menu (mobile).
 */
export type Navigation = {
    items: NavItem[];

    /**
     * If the navigation is not currently showing the root realms, this is a
     * link to the parent realm
     */
    parentLink: string | null;
};

type NavItem = {
    /** Some unique ID. */
    id: string;

    /** What's shown to the user. */
    label: string;

    /** Absolute path, without domain. */
    link: string;

    /** Whether this item is currently the active route. */
    active: boolean;
};

/** The breakpoint, in pixels, where mobile/desktop navigations are swapped. */
export const BREAKPOINT = 850;



// ===== Helper machinery to be able to work with both kinds of navigation sources ===============

/** Prop type directly containing navigation data */
type NavDataProp = {
    nav: Navigation;
};

/** Prop type containing a source for navigation data */
type NavSourceProp = {
    source: NavSource;
};

/** Props defining a nested component and its props */
type ForwardProps<InnerProps> = {
    Component: React.ComponentType<InnerProps & NavDataProp>;
    innerProps: InnerProps;
};

/**
 * Component taking a navigation data source and an inner component. Renders the
 * inner component with the resolved navigation data (either directly or by
 * extracting from the given query).
 */
function Dispatch<InnerProps>(
    { source, Component, innerProps }: ForwardProps<InnerProps> & NavSourceProp
) {
    if (source.kind === "static") {
        return React.createElement(Component, { nav: source.data, ...innerProps });
    } else {
        return <ViaQuery fragRef={source.fragRef} Component={Component} innerProps={innerProps} />;
    }
}

type ViaQueryProps<InnerProps> = ForwardProps<InnerProps> & {
    fragRef: NavigationData$key;
};

/**
 * Takes a fragRef, extracts navigation data from it and renders inner
 * component with said data.
 */
function ViaQuery<InnerProps>({ fragRef, Component, innerProps }: ViaQueryProps<InnerProps>) {
    const realm = useFragment(
        graphql`
            fragment NavigationData on Realm {
                id
                name
                children { id name path }
                parent {
                    children { id name path }
                    path
                }
            }
        `,
        fragRef,
    );

    const items = realm.children.length > 0
        ? realm.children.map(({ id, path, name }) => ({
            id,
            label: name,
            link: `${path}`,
            active: false,
        }))
        : (realm.parent?.children ?? []).map(({ id, name, path }) => ({
            id,
            label: name,
            link: `${path}`,
            active: id === realm.id,
        }));

    let parentLink = null;
    if (realm.parent !== null) {
        parentLink = realm.parent.path === "" ? "/" : `${realm.parent.path}`;
    }
    const nav = { items, parentLink };

    return React.createElement(Component, { nav, ...innerProps });
}



// ===== Desktop Navigation ======================================================================

type DesktopProps = {
    layoutCss: Interpolation<Theme>;
};

export const DesktopNav: React.FC<NavSourceProp & DesktopProps> = ({ source, ...innerProps }) => (
    <Dispatch source={source} Component={DesktopNavImpl} innerProps={innerProps} />
);

const DesktopNavImpl: React.FC<NavDataProp & DesktopProps> = ({ nav, layoutCss }) => (
    <ul css={{
        backgroundColor: "#F1F1F1",
        border: "1px solid #C5C5C5",
        borderRadius: 4,
        listStyle: "none",
        margin: 0,
        padding: 0,
        "& > li:last-of-type": {
            borderBottom: "none",
        },
        ...(layoutCss as Record<string, unknown>),
    }}>
        {nav.items.map(item => <Item key={item.id} item={item} />)}
    </ul>
);



// ===== Mobile Navigation =======================================================================

type MobileProps = {
    /** Function that hides the burger menu. */
    hide: () => void;
};

export const MobileNav: React.FC<NavSourceProp & MobileProps> = ({ source, ...innerProps }) => (
    <Dispatch source={source} Component={MobileNavImpl} innerProps={innerProps} />
);

const MobileNavImpl: React.FC<NavDataProp & MobileProps> = ({ nav, hide }) => (
    <div
        onClick={hide}
        css={{
            position: "absolute",
            top: "var(--header-height)",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "#000000a0",
        }}
    >
        <div
            onClick={e => e.stopPropagation()}
            css={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "#F1F1F1",
                height: "100%",
                width: "clamp(260px, 75%, 450px)",
                overflowY: "auto",
            }}
        >
            {nav.parentLink !== null && (
                <Link
                    to={nav.parentLink}
                    css={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 5px",
                        margin: 6,
                        border: "1px solid #C5C5C5",
                        borderRadius: 4,
                        ...ITEM_LINK_BASE_STYLE,
                    }}
                >
                    <IoChevronBack css={{ marginRight: 6 }}/>
                    Back
                </Link>
            )}
            <ul css={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                borderTop: "1px solid #ccc",
            }}>
                {nav.items.map(item => <Item key={item.id} item={item} />)}
            </ul>
        </div>
    </div>
);



// ===== Other stuff ??????=======================================================================

const TRANSITION_DURATION = "0.1s";
const ITEM_LINK_BASE_STYLE = {
    textDecoration: "none",
    transition: `background-color ${TRANSITION_DURATION}`,

    "& > svg": {
        fontSize: 22,
        color: "#A9A9A9",
        transition: `color ${TRANSITION_DURATION}`,
    },

    "&:hover": {
        transitionDuration: "0.05s",
        backgroundColor: "#E2E2E2",
        "& > svg": {
            transitionDuration: "0.05s",
            color: "#6F6F6F",
        },
    },
};

const Item: React.FC<{ item: NavItem }> = ({ item }) => {
    const baseStyle = {
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    };

    const inner = item.active
        ? <b css={{ ...baseStyle, backgroundColor: "#C5C5C5" }}>
            {item.label}
        </b>
        : <Link
            to={item.link}
            css={{
                ...baseStyle,
                ...ITEM_LINK_BASE_STYLE,
            }}
        >
            <div>{item.label}</div>
            <IoChevronForward />
        </Link>;

    return (
        <li css={{ borderBottom: "1px solid #C5C5C5" }}>
            {inner}
        </li>
    );
};

/**
 * Some routes don't need to fetch data themselves, but only for navigation.
 * This query can be used by those routes.
 */
export const ROOT_NAV_QUERY = graphql`
    query NavigationRootQuery {
        realm: rootRealm {
            ... NavigationData
        }
    }
`;
