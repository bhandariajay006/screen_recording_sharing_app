import React from 'react'
import {getVideoById} from "@/lib/actions/video";
import {redirect} from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

const Page = async ({ params }: Params) => {
    const { videoId } = await params;

    const videoResult = await getVideoById(videoId);

    console.log(videoResult)

    // if(!video) redirect('/404')

    return (
        <main className="wrapper page">

            <section className="video-details">
                <div className="content">
                    {/*<VideoPlayer videoId={video.videoId} />*/}
                </div>
            </section>
        </main>
    )
}
export default Page
