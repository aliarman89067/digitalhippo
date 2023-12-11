import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";

type Params = string | string[] | undefined;

interface ProductPageProps {
  searchParams: { [key: string]: Params };
}
const parsed = (param: Params) => {
  return typeof param === "string" ? param : undefined;
};
const ProductPage = ({ searchParams }: ProductPageProps) => {
  const sort = parsed(searchParams.sort);
  const category = parsed(searchParams.category);
  return (
    <MaxWidthWrapper>
      <ProductReel
        title={category ?? "Browse high quality assets"}
        query={{
          category,
          limit: 40,
          sort: sort === "asc" || sort === "desc" ? sort : undefined,
        }}
      />
    </MaxWidthWrapper>
  );
};
export default ProductPage;
