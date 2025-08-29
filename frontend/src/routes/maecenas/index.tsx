import { createFileRoute } from '@tanstack/react-router'
import {authRedirect} from "@/lib/functions/guards/authRedirect.ts";
import InnoButton from "@/components/ui/shared/InnoButton.tsx";
import {TextField} from "@mui/material";
import React from "react";

export const Route = createFileRoute('/maecenas/')({
  beforeLoad: authRedirect,
  component: RouteComponent,
})

function RouteComponent() {
  const patrons = ["first", "second", "third"].map((patron) => (
      <div key={patron} className="flex justify-between bg-gray-50 p-3">
        <div className="text-xl">
            { patron }
        </div>
        <div className="flex gap-3">
            <InnoButton>promote</InnoButton>
            <InnoButton>remove</InnoButton>
        </div>
      </div>
  ))
  return (
      <div className="flex min-h-screen flex-col items-center px-2">
        <h1 className="text-2xl sm:text-4xl font-semibold mb-8 flex lg:flex-row items-center gap-4 sm:gap-6 sm:mb-12 sm:mt-8 sm:flex-row flex-col text-center">
          Maecenas page
        </h1>
        <main>
            <div className="flex flex-col items-center gap-5">
                <TextField
                    fullWidth
                    label="Add new patron"
                    value=""
                    // onChange={handleInputChange('full_name')}
                    variant="outlined"
                    size="medium"
                    sx={{
                        width: "50%",
                        fontSize: 18,
                        '& .MuiInputBase-root': {
                            borderRadius: '1rem',
                            fontSize: 18,
                            minHeight: 56,
                            paddingLeft: 1,
                            paddingRight: 1
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: 16,
                            top: '-4px'
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '18.5px 14px'
                        }
                    }}
                />
                <InnoButton>Add patron</InnoButton>
            </div>
          <h2 className="text-xl font-semibold mb-5">
              Patrons list
          </h2>
            <div className="flex-col w-[60vw]">
                {patrons}
            </div>
        </main>
      </div>
  )
}
