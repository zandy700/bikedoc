import type { Metadata } from "next";
import { BikeDetail } from "@/components/bikes/BikeDetail";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `Bike ${decodeURIComponent(id)}` };
}

export default async function BikePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <BikeDetail id={decodeURIComponent(id)} />;
}
