import Text1519 from '@/assets/landing/1519.svg?react'
import Iu from '@/assets/landing/iu.svg?react'
import LetterC from '@/assets/landing/letter-C.svg?react'
import LetterD from '@/assets/landing/letter-D.svg?react'
import LetterM from '@/assets/landing/letter-M.svg?react'
import LetterO from '@/assets/landing/letter-O.svg?react'
import LetterP from '@/assets/landing/letter-P.svg?react'
import { Picture } from '@/components/landing/Picture'
import { SectionIntro } from '@/components/landing/SectionIntro'

import patterns1_128_png from '@/assets/landing/patterns/patterns-1_128.png'
import patterns1_128_webp from '@/assets/landing/patterns/patterns-1_128.webp'
import patterns1_256_png from '@/assets/landing/patterns/patterns-1_256.png'
import patterns1_256_webp from '@/assets/landing/patterns/patterns-1_256.webp'
import patterns2_128_png from '@/assets/landing/patterns/patterns-2_128.png'
import patterns2_128_webp from '@/assets/landing/patterns/patterns-2_128.webp'
import patterns2_256_png from '@/assets/landing/patterns/patterns-2_256.png'
import patterns2_256_webp from '@/assets/landing/patterns/patterns-2_256.webp'
import patterns3_128_png from '@/assets/landing/patterns/patterns-3_128.png'
import patterns3_128_webp from '@/assets/landing/patterns/patterns-3_128.webp'
import patterns3_256_png from '@/assets/landing/patterns/patterns-3_256.png'
import patterns3_256_webp from '@/assets/landing/patterns/patterns-3_256.webp'
import patterns4_128_png from '@/assets/landing/patterns/patterns-4_128.png'
import patterns4_128_webp from '@/assets/landing/patterns/patterns-4_128.webp'
import patterns4_256_png from '@/assets/landing/patterns/patterns-4_256.png'
import patterns4_256_webp from '@/assets/landing/patterns/patterns-4_256.webp'
import patternsButton_1024_png from '@/assets/landing/patterns/patterns-button_1024.png'
import patternsButton_1024_webp from '@/assets/landing/patterns/patterns-button_1024.webp'
import patternsButton_512_png from '@/assets/landing/patterns/patterns-button_512.png'
import patternsButton_512_webp from '@/assets/landing/patterns/patterns-button_512.webp'
import patternsHero_1024_png from '@/assets/landing/patterns/patterns-hero_1024.png'
import patternsHero_1024_webp from '@/assets/landing/patterns/patterns-hero_1024.webp'
import patternsHero_512_png from '@/assets/landing/patterns/patterns-hero_512.png'
import patternsHero_512_webp from '@/assets/landing/patterns/patterns-hero_512.webp'
import { Link } from '@tanstack/react-router'

const PATRON_TG_USERNAME = 'vkurenkov'

const TRANSLATIONS = {
  ru: {
    Scholarship: 'Стипендия',
    ScholarshipDescription: (
      <>
        Для студентов-бакалавров
        <br />
        Университета Иннополис
        <br />
        от выпускников
      </>
    ),
    Apply: 'Податься',
    ScholarshipAmount: (
      <>
        30 стипендий
        <br />
        12 000 руб/месяц
      </>
    ),
    Duration: 'в течение 6 месяцев',
    DeadlinePeriod: (
      <>
        01.09.2025
        <br />–<br />
        21.09.2025
      </>
    ),
    DeadlineText: (
      <>
        роки
        <br />
        подачи
      </>
    ),
    DeadlineLetter: LetterC,
    OrganizersText: 'рганизаторы',
    OrganizersLetter: LetterO,
    PatronsText: 'еценаты',
    PatronsLetter: LetterM,
    BecomePatron: (
      <>
        Стать
        <br />
        меценатом
      </>
    ),
    ContactInfo: (
      <>
        По всем вопросам —{' '}
        <a
          href="https://t.me/+duU-j-Cb-cQ4Mjli"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          сюда
        </a>
      </>
    ),
    PatronMessageDraft: 'Привет! Хочу стать меценатом стипендии 1519.'
  },
  en: {
    Scholarship: 'Scholarship',
    ScholarshipDescription: (
      <>
        and mentoring
        <br />
        for Innopolis University bachelor
        <br />
        students from alumni
      </>
    ),
    Apply: 'Apply',
    ScholarshipAmount: (
      <>
        30 scholarships
        <br />
        12 000 rub/month
      </>
    ),
    Duration: 'for 6 months',
    DeadlinePeriod: (
      <>
        01.09.2025
        <br />–<br />
        21.09.2025
      </>
    ),
    DeadlineText: (
      <>
        ead
        <br />
        line
      </>
    ),
    DeadlineLetter: LetterD,
    OrganizersText: 'rganizers',
    OrganizersLetter: LetterO,
    PatronsText: 'atrons',
    PatronsLetter: LetterP,
    BecomePatron: (
      <>
        Become
        <br />a patron
      </>
    ),
    ContactInfo: (
      <>
        For any questions — text us{' '}
        <a
          href="https://t.me/+duU-j-Cb-cQ4Mjli"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          here
        </a>
      </>
    ),
    PatronMessageDraft: 'Hi! I want to become a patron of the 1519 scholarship.'
  }
}

export interface PageProps {
  lang: 'ru' | 'en'
}

export function Page({ lang }: PageProps) {
  const t = TRANSLATIONS[lang]

  return (
    <div className="landing font-landing w-full bg-[#f4f4f4] flex flex-col items-stretch justify-center pb-20 font-normal text-base">
      <div className="px-8 mx-auto pt-10 mb-30">
        <div className="flex items-center justify-center gap-4">
          <Link to="/" from="/" className="underline">
            ru
          </Link>
          <Picture
            w={128}
            h={128}
            srcPng={patterns1_128_png}
            srcPng2x={patterns1_256_png}
            srcWebp={patterns1_128_webp}
            srcWebp2x={patterns1_256_webp}
            className="size-[70px] mx-auto translate-x-0.5"
            eager
          />
          <Link to="/en" from="/" className="underline">
            en
          </Link>
        </div>
        <div className="text-center mt-20 md:mt-30 space-y-8 mb-20">
          <h2 className="opacity-25">{t.Scholarship}</h2>
          <div className="relative pointer-events-none select-none w-full">
            <Text1519
              className="w-[250px] md:w-[468px] h-auto mx-auto"
              aria-label="1519"
              role="heading"
            />
            <div className="absolute flex justify-between top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(150px,90vw,500px)] md:w-[768px] xl:w-[1024px]">
              <Picture
                w={768}
                h={512}
                srcPng={patternsHero_512_png}
                srcPng2x={patternsHero_1024_png}
                srcWebp={patternsHero_512_webp}
                srcWebp2x={patternsHero_1024_webp}
                pictureClassName="aspect-[3/4] h-auto w-1/3"
                className="object-cover object-right h-full"
                eager
              />
              <Picture
                w={768}
                h={512}
                srcPng={patternsHero_512_png}
                srcPng2x={patternsHero_1024_png}
                srcWebp={patternsHero_512_webp}
                srcWebp2x={patternsHero_1024_webp}
                pictureClassName="aspect-[3/4] h-auto w-1/3"
                className="object-cover object-left h-full"
                eager
              />
            </div>
          </div>
          <h3 className="opacity-25">{t.ScholarshipDescription}</h3>
        </div>
        <Link
          to="/applicant"
          className="mx-auto cursor-pointer max-w-96 w-full rounded-[100%] text-center h-[30px] flex items-center justify-center border border-black"
        >
          {t.Apply}
        </Link>
      </div>
      <section>
        <SectionIntro className="mb-8">
          <Picture
            w={128}
            h={128}
            srcPng={patterns3_128_png}
            srcPng2x={patterns3_256_png}
            srcWebp={patterns3_128_webp}
            srcWebp2x={patterns3_256_webp}
            className="mx-auto size-[100px] md:size-[130px]"
          />
        </SectionIntro>
        <div className="text-center flex flex-col items-center gap-6">
          <p className="leading-none">{t.ScholarshipAmount}</p>
          <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
          <p className="leading-none">{t.Duration}</p>
        </div>
        <div className="text-lg md:text-2xl grid grid-cols-[1fr_auto_1fr] items-center w-fit mx-auto gap-6 md:gap-10 my-20">
          <div className="flex gap-1">
            <div className="relative h-[80px] md:h-[100px]">
              <t.DeadlineLetter className="h-full w-auto" />
              <Picture
                w={128}
                h={128}
                srcPng={patterns2_128_png}
                srcPng2x={patterns2_256_png}
                srcWebp={patterns2_128_webp}
                srcWebp2x={patterns2_256_webp}
                className="scale-x-[-1] h-full w-auto absolute left-0 bottom-0"
              />
            </div>
            <div className="flex flex-col self-end">{t.DeadlineText}</div>
          </div>
          <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
          <p className="leading-none text-center">{t.DeadlinePeriod}</p>
        </div>
        <Picture
          w={128}
          h={128}
          srcPng={patterns1_128_png}
          srcPng2x={patterns1_256_png}
          srcWebp={patterns1_128_webp}
          srcWebp2x={patterns1_256_webp}
          className="mx-auto mb-20 size-[90px]"
        />
      </section>
      <section>
        <SectionIntro>
          <div className="flex items-end justify-center">
            <div className="relative h-[80px] md:h-[100px]">
              <t.OrganizersLetter className="h-full w-auto" />
              <Picture
                w={128}
                h={128}
                srcPng={patterns4_128_png}
                srcPng2x={patterns4_256_png}
                srcWebp={patterns4_128_webp}
                srcWebp2x={patterns4_256_webp}
                className="scale-x-[-1] h-full w-auto absolute left-0 bottom-0"
              />
            </div>
            <span className="text-lg md:text-2xl">{t.OrganizersText}</span>
          </div>
        </SectionIntro>
        <div className="flex flex-wrap justify-center max-w-[calc(160px*4+24px*3)] [&>*]:w-[160px] gap-[24px] my-20 mx-auto">
          {[1, 2, 3].map((v) => (
            <div className="flex flex-col items-center gap-2" key={v}>
              <img
                src="https://placehold.co/640x360.png"
                alt=""
                className="bg-white size-[120px] rounded-full object-cover"
              />
              <p className="text-center md:text-xl">
                <span>Бамблслав</span>
                <br />
                <span>Эспрессотоников</span>
              </p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionIntro className="mb-20">
          <div className="flex items-end justify-center">
            <div className="relative h-[80px] md:h-[100px]">
              <t.PatronsLetter className="inline-block h-full w-auto" />
              <Picture
                w={128}
                h={128}
                srcPng={patterns3_128_png}
                srcPng2x={patterns3_256_png}
                srcWebp={patterns3_128_webp}
                srcWebp2x={patterns3_256_webp}
                className="h-full w-auto absolute right-0 bottom-0"
              />
            </div>
            <span className="text-lg md:text-2xl">{t.PatronsText}</span>
          </div>
        </SectionIntro>
        <div className="flex flex-wrap justify-center max-w-[calc(160px*4+24px*3)] [&>*]:w-[160px] gap-[24px] my-20 mx-auto">
          {Array.from({ length: 11 }).map((_, v) => (
            <div className="flex flex-col items-center gap-2" key={v}>
              <img
                src="https://placehold.co/640x360.png"
                alt=""
                className="bg-white size-[120px] rounded-full object-cover"
              />
              <p className="text-center md:text-xl">
                <span>Alexey</span>
                <br />
                <span>Alexeev</span>
              </p>
            </div>
          ))}
          <div>
            <a
              href={`https://t.me/${PATRON_TG_USERNAME}?text=${encodeURIComponent(t.PatronMessageDraft)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-center text-sm md:text-base leading-none flex flex-col items-center justify-center size-[120px] mx-auto rounded-full bg-white border border-black pb-3"
            >
              <Picture
                w={128}
                h={128}
                srcPng={patterns1_128_png}
                srcPng2x={patterns1_256_png}
                srcWebp={patterns1_128_webp}
                srcWebp2x={patterns1_256_webp}
                className="size-[32px]"
              />
              <span>{t.BecomePatron}</span>
            </a>
          </div>
        </div>
        <Link
          to="/applicant"
          className="block w-[300px] md:w-[450px] relative text-lg md:text-2xl cursor-pointer mx-auto mb-6"
        >
          <Picture
            w={512}
            h={512}
            srcPng={patternsButton_512_png}
            srcPng2x={patternsButton_1024_png}
            srcWebp={patternsButton_512_webp}
            srcWebp2x={patternsButton_1024_webp}
            className="w-full h-auto"
          />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2">{t.Apply}</span>
        </Link>
        <p className="text-center opacity-25">{t.ContactInfo}</p>
      </section>
      <Iu className="self-center size-9 mt-40" />
    </div>
  )
}
