import asyncio
import os
import aiohttp
import httpx
from dotenv import load_dotenv

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService
from pipecat.services.openai.realtime.events import SessionProperties
from pipecat.services.heygen.api_interactive_avatar import NewSessionRequest
from pipecat.transports.heygen.transport import HeyGenParams, HeyGenTransport, ServiceType

load_dotenv()

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
HEYGEN_BASE = "https://api.heygen.com"

async def run_pipeline(avatar_id: str):
    async with aiohttp.ClientSession() as session:
        transport = HeyGenTransport(
            session=session,
            api_key=HEYGEN_API_KEY,
            service_type=ServiceType.INTERACTIVE_AVATAR,
            params=HeyGenParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
            ),
            session_request=NewSessionRequest(
                avatar_id=avatar_id,
                version="v2",
            ),
        )

        llm = OpenAIRealtimeLLMService(
            api_key=os.getenv("OPEN_API_KEY"),
            model="gpt-4o-realtime-preview-2025-06-03",
            session_properties=SessionProperties(
                instructions="Always respond in English, respond as a friend.",
            ),
        )

        pipeline = Pipeline([
            transport.input(),
            llm,
            transport.output(),
        ])

        task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))

        @transport.event_handler("on_connected")
        async def on_connected(*args):
            print("Connected!")

        runner = PipelineRunner()
        await runner.run(task)


async def main():
    avatar_id = "Ann_Therapist_public"  # built-in HeyGen avatar
    await run_pipeline(avatar_id)


asyncio.run(main())
