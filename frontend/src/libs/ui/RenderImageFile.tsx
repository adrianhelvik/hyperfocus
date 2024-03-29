import { useEffect, useState } from "react";

export default function RenderImageFile({ file }: { file: File }) {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        console.log(img, file);
        if (!img) return;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = String(e.target.result);
        };
        reader.readAsDataURL(file);
    }, [img, file]);

    return <img ref={(e) => setImg(e)} alt="" />;
}
