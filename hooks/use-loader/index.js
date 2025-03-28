'use client'

import { useState, useContext, createContext, useEffect } from 'react'
// 可自訂載入動畫元件
import { DefaultLoader, LoaderText } from './components'
import { usePathname, useSearchParams } from 'next/navigation'

const LoaderContext = createContext(null)

/**
 * 延遲ms秒用，可以回傳值x，手動控制關閉有用
 */
export function delay(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms))
  }
}

/**
 * 延遲ms秒用，手動控制關閉有用(相當於setTimeout的Promise版)
 */
export function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 全站的Context狀態
// loader是元件，可以放於全站版面上，要用時用showLoader控制
// close 代表幾秒後關閉
export const LoaderProvider = ({
  children,
  close = 2,
  global = false,
  CustomLoader = DefaultLoader,
  text = '', // 單純文字用的
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleChangeStart = () => {
      if (global) {
        setShow(true)
      }
    }

    const handleChangeEnd = () => {
      // auto close
      if (close && global) {
        timeout(close * 1000).then(() => setShow(false))
      }
    }

    handleChangeStart()

    return () => {
      handleChangeEnd()
    }
    // eslint-disable-next-line
  }, [pathname, searchParams])

  return (
    <LoaderContext.Provider
      value={{
        showLoader: () => {
          setShow(true)

          // auto close
          if (close) {
            timeout(close * 1000).then(() => setShow(false))
          }
        },
        hideLoader: () => (!close ? setShow(false) : null),
        loading: show,
        delay,
      }}
    >
      {children}
      <CustomLoader show={show} />
      {text && <LoaderText text={text} show={show} />}
    </LoaderContext.Provider>
  )
}

// 配合context的元件
export const useLoader = () => {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error('useLoader must be used within LoadingProvider')
  }

  return context
}
