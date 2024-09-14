import { getYesterdayDate } from "../utils/functions"

export default function Index(){
    console.log(getYesterdayDate())
    return(
        <section className="pt-[100px]">
            <h1>Este es el index</h1>
        </section>
    )
}