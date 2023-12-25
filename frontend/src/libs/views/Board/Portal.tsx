import Deck from "./Deck";

export default function Portal(props: Parameters<typeof Deck>[0]) {
    return <Deck {...props} />;
}
