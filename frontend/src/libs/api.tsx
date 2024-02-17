import local from "local";

let persistentHeaders = local.get("persistentHeaders", {});

export default new Proxy({} as any, {
    get(_, name) {
        return (body) => callProcedure(name, body);
    },
});

async function callProcedure(name, body = {}) {
    body = { ...body };

    const headers = {
        "Content-Type": "application/json",
        ...persistentHeaders,
    };

    try {
        var response = await fetch(`${import.meta.env.VITE_API_URL}/${name}`, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers,
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error(`Failed to call procedure "${name}"`, {
            headers,
            body,
        });
        throw e;
    }

    const data = await response.json();

    if (String(response.status)[0] !== "2") throw Error(data.message);

    return data;
}

export function setPersistentHeader(key: string, value: string) {
    local.set("persistentHeaders", {
        ...local.get("persistentHeaders", {}),
        [key]: value,
    });

    persistentHeaders = local.get("persistentHeaders");
}
