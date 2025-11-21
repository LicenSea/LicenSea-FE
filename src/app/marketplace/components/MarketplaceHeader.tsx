import lineageImg from "@/assets/lineage.png";

export const MarketplaceHeader = () => {
  return (
    <div
      className="w-full mt-20 h-40 bg-black"
      style={{
        backgroundImage: `url(${lineageImg.src})`,
        backgroundRepeat: "repeat-x",
        backgroundPositionX: "center",
        backgroundSize: "contain",
      }}
    />
  );
};
