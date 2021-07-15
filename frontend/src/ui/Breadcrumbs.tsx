import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faHome } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import { Link } from "../router";


type Props = {
    path: PathSegment[];
};

type PathSegment = {
    label: string;
    link: string;
};

export const Breadcrumbs: React.FC<Props> = ({ path }) => {
    const { t } = useTranslation();

    return (
        <nav aria-label="breadcrumbs">
            <ol css={{ listStyle: "none", padding: 0, margin: 0 }}>
                <Segment target="/" first active={path.length === 0}>
                    <FontAwesomeIcon title={t("home")} icon={faHome} />
                </Segment>
                {path.map((segment, i) => (
                    <Segment key={i} target={segment.link} active={i === path.length - 1}>
                        {segment.label}
                    </Segment>
                ))}
            </ol>
        </nav>
    );
};

type SegmentProps = {
    target: string;
    active: boolean;
    first?: boolean;
};

const Segment: React.FC<SegmentProps> = ({ target, active, first = false, children }) => (
    <li css={{ display: "inline" }} {...active && { "aria-current": "location" }}>
        {first || (
            <FontAwesomeIcon
                icon={faAngleRight}
                css={{ margin: "0 8px", color: "var(--grey65)" }}
            />
        )}
        {active ? children : <Link to={target}>{children}</Link>}
    </li>
);
