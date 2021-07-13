import React from "react";

import { keyOfId } from "../../util";
import { Block, Title } from "../Blocks";
import type { BlockData } from "../Blocks";
import { Link } from "../../router";


type Props = {
    title?: string;
    series: NonNullable<BlockData["series"]>;
    realmPath: string;
};

export const SeriesBlock: React.FC<Props> = ({ title, series, realmPath }) => {
    const [THUMB_WIDTH, THUMB_HEIGHT] = [16, 9].map(x => x * 13);

    return (
        <Block>
            <Title title={title} />
            <div css={{
                display: "flex",
                flexWrap: "wrap",
            }}>
                {series.events.map(event => {
                    const url = `${realmPath}/v/${keyOfId(event.id)}`;

                    return (
                        <div
                            key={event.id}
                            css={{
                                margin: "12px 8px",
                                width: THUMB_WIDTH,
                                "& a": { color: "black", textDecoration: "none" },
                            }}
                        >
                            <Link to={url} css={{ position: "relative", display: "block" }}>
                                <img
                                    src={event.thumbnail}
                                    width={THUMB_WIDTH}
                                    height={THUMB_HEIGHT}
                                    css={{ display: "block" }}
                                />
                                {event.duration != null && (
                                    <div css={{
                                        position: "absolute",
                                        right: 6,
                                        bottom: 6,
                                        backgroundColor: "hsla(0, 0%, 0%, 0.75)",
                                        border: "1px solid black",
                                        borderRadius: 4,
                                        padding: "0 4px",
                                        color: "white",
                                    }}>
                                        {formatLength(event.duration)}
                                    </div>
                                )}
                            </Link>

                            <h3 css={{
                                fontSize: 16,
                            }}>
                                <Link to={url}>{event.title}</Link>
                            </h3>
                        </div>
                    );
                })}
            </div>
        </Block>
    );
};

const formatLength = (totalMs: number) => {
    const totalSeconds = Math.round(totalMs / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    } else {
        return `${minutes}:${pad(seconds)}`;
    }
};
